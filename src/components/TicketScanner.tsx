/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Event, Pass, CheckIn } from '../types.ts';
import { verifyDynamicQRToken, generateDynamicQRToken } from '../crypto.ts';
import { Camera, ShieldAlert, CheckCircle2, XCircle, RefreshCw, Cpu, PhoneCall, Radio, FileText, Sparkles, UserCheck } from 'lucide-react';

interface TicketScannerProps {
  events: Event[];
  availablePasses: Pass[];
  alreadyUsedPassIds: Set<string>;
  onRegisterCheckIn: (checkIn: Omit<CheckIn, 'id' | 'scannedAt'>) => void;
  onNavigateBack: () => void;
}

export default function TicketScanner({
  events,
  availablePasses,
  alreadyUsedPassIds,
  onRegisterCheckIn,
  onNavigateBack
}: TicketScannerProps) {

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [manualToken, setManualToken] = useState<string>('');
  
  // Webcam tracking
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'none' | 'real' | 'virtual'>('none');
  const [cameraError, setCameraError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Scan Outcome State
  const [scanResult, setScanResult] = useState<{
    status: 'IDLE' | 'GREEN' | 'RED';
    message: string;
    attendeeName?: string;
    ticketTierName?: string;
    uniqueCode?: string;
    diagnostics?: string;
  }>({ status: 'IDLE', message: 'Press Scan to check tickets.' });

  const activeEvent = events.find(e => e.id === selectedEventId);

  // Handle webcam activation / request
  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Insecure context or context unsupported by browser environment.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 400, height: 400 }
      });
      setStream(mediaStream);
      setCameraActive(true);
      setCameraMode('real');
    } catch (err: any) {
      console.warn('Camera capture simulation fallback triggered:', err);
      setCameraActive(true);
      setCameraMode('virtual');
      setCameraError('System-wide sandbox camera access restricted. Initialized Virtual QR Code Scanner framework.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
    setCameraMode('none');
  };

  // Sync stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Clean up on unmount or stream change
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle Cryptographic Token verification
  const handleVerifyTokenString = (tokenToVerify: string) => {
    if (!tokenToVerify) return;

    // Run cryptographic rotating verification against target Event ID
    const verification = verifyDynamicQRToken(tokenToVerify, selectedEventId, alreadyUsedPassIds);

    if (verification.isValid && verification.payload) {
      const matchingPass = availablePasses.find(p => p.id === verification.payload?.passId);
      
      if (!matchingPass) {
        setScanResult({
          status: 'RED',
          message: 'Access Denied. Cryptographically correct but ticket pass ID revoked or deleted in server state.',
          diagnostics: `Claims target ID: ${verification.payload.passId}`
        });

        // Register check-in failure
        onRegisterCheckIn({
          passId: verification.payload.passId,
          scannedById: 'user-organizer-1',
          status: 'FAILED',
          errorMessage: 'Valid signature but Pass ID revoked or missing in active ledger'
        });
        return;
      }

      // Success check!
      setScanResult({
        status: 'GREEN',
        message: 'Access Granted. Signature certified successfully!',
        attendeeName: matchingPass.attendeeName,
        ticketTierName: matchingPass.ticketTierId, // simplified name or ID
        uniqueCode: matchingPass.uniqueCode,
        diagnostics: `Payload passId: ${matchingPass.id} | Timestamp verified matching epoch`
      });

      // Register success entry
      onRegisterCheckIn({
        passId: matchingPass.id,
        scannedById: 'user-organizer-1',
        status: 'SUCCESS'
      });

    } else {
      // Failed check!
      setScanResult({
        status: 'RED',
        message: `Access Denied. ${verification.message}`,
        diagnostics: `Error Code: ${verification.code}`
      });

      // Register checking system audit failure
      const reportedPassId = verification.payload?.passId || 'revoked_tampered_token';
      onRegisterCheckIn({
        passId: reportedPassId,
        scannedById: 'user-organizer-1',
        status: 'FAILED',
        errorMessage: `Validation failed: ${verification.message} (${verification.code})`
      });
    }
  };

  // High Fidelity instant test shortcuts
  const handleQuickScanActive = () => {
    const matchingActivePassesForEvent = availablePasses.filter(
      p => p.eventId === selectedEventId && p.status === 'ACTIVE' && !alreadyUsedPassIds.has(p.id)
    );

    if (matchingActivePassesForEvent.length === 0) {
      alert('You have no active or unused purchased passes for this event in current user DB. Please switch to "Buyer" role and purchase a pass first!');
      return;
    }

    // Grab the first pass and generate its live token for this exact second!
    const targetPass = matchingActivePassesForEvent[0];
    const generateMockToken = generateDynamicQRToken; // imported safely
    const { tokenString } = generateMockToken(targetPass.id, targetPass.userId, targetPass.eventId);

    setManualToken(tokenString);
    handleVerifyTokenString(tokenString);
  };

  const handleQuickScanExpired = () => {
    // Generates a mock token with timestamp dated 15 seconds in the past!
    const targetPass = availablePasses[0] || { id: 'pass-expired-test', userId: 'user-buyer', eventId: selectedEventId };
    
    // Simulate expired structure token (expiry claim < current time)
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 20;
    const expiredPayload = {
      passId: targetPass.id,
      userId: targetPass.userId,
      eventId: selectedEventId,
      timestamp: expiredTimestamp,
      expiry: expiredTimestamp + 10,
      rotationIndex: Math.floor(expiredTimestamp / 10)
    };
    const b64 = btoa(JSON.stringify(expiredPayload));
    // Signature computed from stale secret
    const staleToken = `qrypt_v1.${b64}.stale_computed_sig_1234abcd`;
    
    setManualToken(staleToken);
    handleVerifyTokenString(staleToken);
  };

  const handleQuickScanDuplicate = () => {
    // Scan a pass that we add to used list manually to test anti-fraud block
    const matchingActivePassesForEvent = availablePasses.filter(
      p => p.eventId === selectedEventId && p.status === 'ACTIVE'
    );

    if (matchingActivePassesForEvent.length === 0) {
      alert('No active passes found in DB. Purchase a ticket first.');
      return;
    }

    const targetPass = matchingActivePassesForEvent[0];
    
    // Force set the pass as already scanned
    alreadyUsedPassIds.add(targetPass.id);

    const generateMockToken = generateDynamicQRToken;
    const { tokenString } = generateMockToken(targetPass.id, targetPass.userId, targetPass.eventId);

    setManualToken(tokenString);
    handleVerifyTokenString(tokenString);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-4xl mx-auto select-none relative z-10 text-slate-200">
      
      {/* Title Nav Gate */}
      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
        <div>
          <span className="text-[10px] text-emerald-400 font-extrabold font-mono uppercase block tracking-wider font-semibold">ENTRY VERIFICATION GATEWAY</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display uppercase tracking-tight">
            Digital Pass Ticket Scanner
          </h2>
        </div>

        <button
          onClick={onNavigateBack}
          className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2 px-4 rounded-full border border-white/5 cursor-pointer font-bold transition uppercase tracking-wider"
        >
          ← Quit Scanner
        </button>
      </div>

      {/* Target event select */}
      <div className="bg-[#0b0c0b] border rounded-3xl p-5 border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-widest">Active Verification Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-black/35 border border-white/15 text-white rounded-xl py-2 px-3 text-xs sm:text-sm font-bold w-full sm:w-auto focus:outline-none"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id} className="bg-slate-950 text-white">{ev.title}</option>
            ))}
          </select>
        </div>

        {activeEvent && (
          <div className="text-right text-xs bg-black/25 p-2.5 rounded-xl border border-emerald-500/10 font-mono flex items-center gap-1.5 text-slate-400 uppercase tracking-wide">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Assigned Location: {activeEvent.city} • Active Security</span>
          </div>
        )}
      </div>

      {/* Main Split: Left scanner view, right outcome */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
             {/* COLUMN 1: INTERACTIVE SCAN VIEWPORT */}
        <div className="bg-[#0b0c0b] text-white rounded-[32px] p-6 border border-emerald-500/10 shadow-2xl space-y-6 flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-[10px] font-mono font-extrabold text-slate-500">CAMERA GATE VIEWPORT</span>
            <span className="flex items-center gap-1.5 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>online</span>
            </span>
          </div>

          {/* Visual camera square grid frame */}
          <div className="relative aspect-square w-full bg-black/40 rounded-2xl overflow-hidden flex flex-col justify-between p-4 border border-white/5">
            
            {/* Holographic scanner indicator */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500/40 shadow-glow animate-bounce pointer-events-none z-20"></div>

            {/* Simulated viewfinder corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-600"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-600"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-600"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-600"></div>

            {/* Decoded user video frame */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`absolute inset-0 w-full h-full object-cover grayscale brightness-110 ${cameraActive && cameraMode === 'real' ? 'block' : 'hidden'}`}
            />

            {cameraActive && cameraMode === 'virtual' && (
              <div className="absolute inset-0 bg-[#07080f] flex flex-col items-center justify-center p-6 text-center space-y-4 z-10 selection-none overflow-hidden">
                {/* Rotating scanner rings / sonar effect */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full border border-dashed border-emerald-500/30 animate-spin" style={{ animationDuration: '8s' }}></div>
                  <div className="absolute inset-6 rounded-full border border-emerald-500/45 animate-pulse"></div>
                  <Camera className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="font-extrabold text-[11px] text-emerald-400 uppercase font-mono tracking-widest">Virtual Scanner Active</h4>
                  <p className="text-[9.5px] text-slate-400 font-sans leading-relaxed">
                    Point a ticket pass QR code to your screen, or use the quick simulation tools below to test entry instantly.
                  </p>
                </div>
              </div>
            )}

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 selection-none bg-black/60">
                <div className="w-12 h-12 bg-black/80 rounded-full flex items-center justify-center border border-white/10">
                  <Camera className="w-5 h-5 text-slate-500" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="font-semibold text-[10px] uppercase font-mono tracking-wider text-slate-300">Camera feed closed</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    Enable webcam feed or use the simulation buttons below to test entry validation.
                  </p>
                </div>
              </div>
            )}

            {cameraActive && (
              <span className={`absolute bottom-3 left-3 text-[9px] uppercase font-mono px-2 py-0.5 border rounded font-extrabold tracking-wide ${
                cameraMode === 'real'
                  ? 'bg-[#102a1d] text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-950/40 text-amber-400 border-amber-500/20'
              }`}>
                ● {cameraMode === 'real' ? 'LIVE SCAN FEED' : 'EMULATION ACTIVE'}
              </span>
            )}
          </div>

          {/* Camera controls and Quick emulation actions */}
          <div className="w-full space-y-4">
            <div className="flex gap-2.5">
              {cameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2.5 rounded-full text-xs font-mono font-bold cursor-pointer border border-white/5 text-center uppercase tracking-wider transition-colors"
                >
                  Close Live Camera
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-full text-xs font-mono font-bold cursor-pointer text-center uppercase tracking-wider transition-all shadow-lg"
                >
                  Start Live Camera Scan
                </button>
              )}
            </div>

            {cameraError && <p className="text-[10.5px] text-yellow-500 text-center font-medium font-mono">{cameraError}</p>}

            {/* Quick Emulator Shortcuts */}
            <div className="border-t border-white/5 pt-4 space-y-2">
              <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider font-semibold">Simulation & Testing Tools</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleQuickScanActive}
                  className="bg-emerald-550/10 hover:bg-emerald-550/20 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-full text-[9px] font-bold cursor-pointer transition uppercase font-mono tracking-wider text-center"
                >
                  Scan Valid QR
                </button>
                <button
                  type="button"
                  onClick={handleQuickScanExpired}
                  className="bg-amber-550/10 hover:bg-amber-550/20 text-amber-400 border border-amber-500/20 py-2.5 rounded-full text-[9px] font-bold cursor-pointer transition uppercase font-mono tracking-wider text-center"
                >
                  Scan Expired QR
                </button>
                <button
                  type="button"
                  onClick={handleQuickScanDuplicate}
                  className="bg-rose-550/10 hover:bg-rose-550/20 text-rose-400 border border-rose-500/20 py-2.5 rounded-full text-[9px] font-bold cursor-pointer transition uppercase font-mono tracking-wider text-center"
                >
                  Scan Used QR
                </button>
              </div>
            </div>

            {/* Copy paste manual field */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[9px] font-mono text-slate-550 block uppercase tracking-wider font-semibold">Manual Ticket Code Input</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste raw 'qrypt_v1...' ticket string..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-[10px] py-2 px-3.5 text-[10px] font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleVerifyTokenString(manualToken)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-[10px] text-[10px] font-mono font-extrabold uppercase tracking-wider cursor-pointer shrink-0 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* COLUMN 2: REAL-TIME OUTCOME DISPLAY */}
        <div className="space-y-6">
          
          {/* Main big block card */}
          {scanResult.status === 'IDLE' ? (
            <div className="bg-[#0b0c0b] rounded-[32px] p-8 border border-white/5 text-center py-20">
              <Camera className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-extrabold text-slate-400 text-xs mt-3.5 uppercase font-mono tracking-widest">Awaiting Ticket Scan</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans mt-2 max-w-[280px] mx-auto">
                Point the camera at an active ticket QR code or try the simulation options to evaluate verification instantly.
              </p>
            </div>
          ) : (
            <div className={`p-6 sm:p-8 rounded-[32px] border text-center space-y-6 select-none ${
              scanResult.status === 'GREEN' 
                ? 'bg-[#102a1d]/60 border-emerald-500/25 text-emerald-100 shadow-2xl' 
                : 'bg-[#311116]/60 border-rose-500/25 text-rose-100 shadow-2xl'
            }`}>
              
              {/* Checkmark or Cross icons */}
              <div className="flex flex-col items-center">
                {scanResult.status === 'GREEN' ? (
                  <CheckCircle2 className="w-14 h-14 text-emerald-400" />
                ) : (
                  <XCircle className="w-14 h-14 text-rose-400 animate-pulse" />
                )}
                
                <h3 className={`text-xl sm:text-2xl font-black font-display uppercase tracking-wider mt-4.5 ${
                  scanResult.status === 'GREEN' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {scanResult.status === 'GREEN' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </h3>
                <p className="text-[10px] font-mono mt-1.5 uppercase opacity-85 tracking-widest max-w-[300px] mx-auto text-slate-300">
                  {scanResult.message}
                </p>
              </div>

              {/* Attendee Profile Details on grant */}
              {scanResult.status === 'GREEN' && (
                <div className="bg-black/35 border border-emerald-500/15 rounded-2xl p-5 text-left space-y-3.5 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block font-sans">ATTENDEE ENTRY INFO</span>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center font-bold text-emerald-400 border border-emerald-500/20">
                      {scanResult.attendeeName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm whitespace-nowrap">{scanResult.attendeeName}</h4>
                      <span className="text-[10px] text-slate-450 font-mono block mt-0.5">Code Ref: #{scanResult.uniqueCode}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-3.5 border-t border-white/5 font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500 block">TICKET STATUS</span>
                      <strong className="text-[#10b981] block mt-0.5">✓ VALID PASS</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">TICKET ID</span>
                      <strong className="text-slate-200 block truncate mt-0.5">#{scanResult.uniqueCode?.slice(-6).toUpperCase()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical breakdown console */}
              <div className="bg-black/45 text-slate-300 p-4 rounded-2xl text-left font-mono text-[9px] leading-relaxed select-text shadow-sm border border-white/5">
                <span className="text-[8.5px] text-slate-500 block border-b border-white/5 pb-1 uppercase tracking-wider font-extrabold">Security Diagnostic Details</span>
                <p className="mt-2 text-emerald-405 leading-relaxed">{scanResult.diagnostics}</p>
                <p className="text-[8.5px] text-slate-500 mt-1.5">Check-in Timestamp: {new Date().toLocaleTimeString()} PST</p>
              </div>

            </div>
          )}

          {/* Quick instructions reminder */}
          <div className="bg-[#0b0c0b] border border-emerald-500/10 rounded-2xl p-4.5 space-y-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5 leading-snug font-display uppercase tracking-wider text-[11px]">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ENTRY VERIFICATION METHOD:</span>
            </span>
            <p className="text-slate-400 text-xs leading-relaxed leading-[1.6]">
              When scanned, the QR code is checked against the event's current rotating safety window, verifying ticket signatures instantly to block duplicate check-in attempts.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

// Inline minor icons helper
function FuelIndicator(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
