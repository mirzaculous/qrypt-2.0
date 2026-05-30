/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// A secure, pure TypeScript simulation of a JWT and rotating secret signature system.
// In production, this runs on the server (Nodejs) with a secret key changing every interval.

// Generate a pseudo-random secret that changes or rotates over time (or is constant per session)
const MASTER_SALT = 'QRYPT_SECURE_EVENT_ACCESS_SALT_2026';

/**
 * Returns the currently active rotating secret based on the 10-second epoch.
 * Allows validating tokens generated in the previous interval by checking adjacent periods.
 */
function getRotatingSecret(epochSeconds: number): string {
  // Rotate the key code every 10 seconds.
  const intervalIndex = Math.floor(epochSeconds / 10);
  // Simple deterministic hash of the interval + salt to produce a rotating secret
  const combined = `${intervalIndex}-${MASTER_SALT}`;
  return simpleHash(combined);
}

/**
 * High-speed deterministic hashing function to produce signatures in client/server simulator
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex representation
  const unsignedHash = hash >>> 0;
  return unsignedHash.toString(16).padStart(8, '0');
}

/**
 * Generates a Dynamic QR Token (cryptographic state) for a ticket pass.
 * @param passId Unique ticket pass ID
 * @param userId User buying or presenting the pass
 * @param eventId The event being attended
 */
export function generateDynamicQRToken(passId: string, userId: string, eventId: string): {
  tokenString: string;
  payload: {
    passId: string;
    userId: string;
    eventId: string;
    timestamp: number;
    expiry: number;
    rotationIndex: number;
  };
  signature: string;
  expiresInSeconds: number;
} {
  const nowMs = Date.now();
  const nowSeconds = Math.floor(nowMs / 1000);
  
  // Expiry is strictly 10 seconds from now
  const expiry = nowSeconds + 10;
  
  const payload = {
    passId,
    userId,
    eventId,
    timestamp: nowSeconds,
    expiry,
    rotationIndex: Math.floor(nowSeconds / 10)
  };

  // Create signature using the secret for this exact timestamp
  const secretKey = getRotatingSecret(nowSeconds);
  const rawSignatureTarget = `${payload.passId}:${payload.userId}:${payload.eventId}:${payload.timestamp}:${payload.expiry}:${secretKey}`;
  const signature = simpleHash(rawSignatureTarget);

  // Encode token as a compact base64-like URL safe token
  const encodedPayload = btoa(JSON.stringify(payload));
  const tokenString = `qrypt_v1.${encodedPayload}.${signature}`;

  return {
    tokenString,
    payload,
    signature,
    expiresInSeconds: 10 - (nowSeconds % 10) // remaining seconds in current rotation
  };
}

export interface VerificationResult {
  isValid: boolean;
  code: 'SUCCESS' | 'EXPIRED' | 'INVALID_SIGNATURE' | 'ALREADY_USED' | 'MALFORMED' | 'EVENT_MISMATCH';
  message: string;
  payload?: {
    passId: string;
    userId: string;
    eventId: string;
    timestamp: number;
    expiry: number;
  };
}

/**
 * Verifies a dynamic QR token in real time against the current clock and active secrets.
 */
export function verifyDynamicQRToken(
  tokenString: string, 
  targetEventId: string,
  alreadyUsedPassIds: Set<string>
): VerificationResult {
  try {
    if (!tokenString || !tokenString.startsWith('qrypt_v1.')) {
      return {
        isValid: false,
        code: 'MALFORMED',
        message: 'Invalid token structure. Not a standard Qrypt Pass.'
      };
    }

    const parts = tokenString.split('.');
    if (parts.length !== 3) {
      return {
        isValid: false,
        code: 'MALFORMED',
        message: 'Token components are incomplete or corrupted.'
      };
    }

    const [header, encodedPayload, signature] = parts;
    if (header !== 'qrypt_v1') {
      return {
        isValid: false,
        code: 'MALFORMED',
        message: 'Unsupported signature header version.'
      };
    }

    // Decode safety
    let decodedString: string;
    try {
      decodedString = atob(encodedPayload);
    } catch {
      return {
        isValid: false,
        code: 'MALFORMED',
        message: 'Payload decompression failed.'
      };
    }

    const payload = JSON.parse(decodedString);
    const { passId, userId, eventId, timestamp, expiry } = payload;

    if (!passId || !userId || !eventId || !timestamp || !expiry) {
      return {
        isValid: false,
        code: 'MALFORMED',
        message: 'Mandatory token claims (passId, userId, eventId) are missing.'
      };
    }

    // Verify correct event routing
    if (eventId !== targetEventId) {
      return {
        isValid: false,
        code: 'EVENT_MISMATCH',
        message: 'This ticket is registered for a different event.'
      };
    }

    // Prevent Double Entry / Ticket Recycling
    if (alreadyUsedPassIds.has(passId)) {
      return {
        isValid: false,
        code: 'ALREADY_USED',
        message: 'Ticket has already been scanned. Duplicate entry blocked!'
      };
    }

    // Expiry Check (We allow a tiny 3-second grace window to compensate for scan lag or clock skew)
    const currentSeconds = Math.floor(Date.now() / 1000);
    const gracePeriod = 3; 
    
    if (currentSeconds > expiry + gracePeriod) {
      const secondsOver = currentSeconds - expiry;
      return {
        isValid: false,
        code: 'EXPIRED',
        message: `Pass expired ${secondsOver} seconds ago. Active rotation block has completed.`
      };
    }

    // Cryptographic Signature verification (checking either current secret key or previous interval)
    let signatureMatches = false;
    
    // Check key active at ticket's creation timestamp
    const secretKeyAtTimestamp = getRotatingSecret(timestamp);
    const computedSignature1 = simpleHash(`${passId}:${userId}:${eventId}:${timestamp}:${expiry}:${secretKeyAtTimestamp}`);
    
    if (computedSignature1 === signature) {
      signatureMatches = true;
    } else {
      // Fallback: Check checking time's active secret key just in case rotation boundaries crossed
      const currentSecretKey = getRotatingSecret(currentSeconds);
      const computedSignature2 = simpleHash(`${passId}:${userId}:${eventId}:${timestamp}:${expiry}:${currentSecretKey}`);
      if (computedSignature2 === signature) {
        signatureMatches = true;
      }
    }

    if (!signatureMatches) {
      return {
        isValid: false,
        code: 'INVALID_SIGNATURE',
        message: 'Cryptographic core verification failed. Potential screenshot, spoofing, or tampering.'
      };
    }

    return {
      isValid: true,
      code: 'SUCCESS',
      message: 'Access Granted. Valid token signature registered.',
      payload: { passId, userId, eventId, timestamp, expiry }
    };
  } catch (error: any) {
    return {
      isValid: false,
      code: 'MALFORMED',
      message: `System scanner error: ${error?.message || 'Unknown processing error'}`
    };
  }
}
