/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, UserRole, Event, Venue, Organization, Order, Pass, CheckIn, Refund, Payout, AuditLog, TicketTier 
} from './types.ts';
import { 
  INITIAL_EVENTS, INITIAL_ORGANIZATIONS, INITIAL_VENUES, MOCK_USERS 
} from './mockData.ts';

// Components imports
import RoleSwitcher from './components/RoleSwitcher.tsx';
import Marketplace from './components/Marketplace.tsx';
import EventDetails from './components/EventDetails.tsx';
import CheckoutModal from './components/CheckoutModal.tsx';
import UserDashboard from './components/UserDashboard.tsx';
import OrganizerDashboard from './components/OrganizerDashboard.tsx';
import TicketScanner from './components/TicketScanner.tsx';
import AdminPanel from './components/AdminPanel.tsx';

// Icons
import { Shield, Sparkles, User as UserIcon, Building2, Ticket, Search, ShieldCheck, Heart, Cpu, Compass, Menu, Laptop, Mail, Settings } from 'lucide-react';

export default function App() {
  
  // Rotating security seconds ticker (30s intervals)
  const [rotatingSeconds, setRotatingSeconds] = useState<number>(30);

  // Core full-stack state tables
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]); // Starts as Asim Siddiqui (Buyer)
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [venues, setVenues] = useState<Venue[]>(INITIAL_VENUES);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  
  // Relational data logs
  const [purchasedPasses, setPurchasedPasses] = useState<Pass[]>([]);
  const [alreadyUsedPassIds, setAlreadyUsedPassIds] = useState<Set<string>>(new Set());
  const [checkInLogs, setCheckInLogs] = useState<CheckIn[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([
    {
      id: 'pay-001',
      organizationId: 'org-salt-arts',
      amount: 45000,
      status: 'PENDING',
      method: 'Bank Wire',
      accountDetails: 'MEEZAN BANK - Salt curator Inc. \nIBAN PK02MEZN0012349929949',
      requestedAt: '2026-05-28T10:00:00Z'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'aud-001',
      userId: 'user-admin',
      userEmail: 'admin@qrypt.pk',
      action: 'SYSTEM_BOOT',
      details: 'Gate Pass Manager successfully started. Security event monitors online.',
      ipAddress: '202.141.22.45',
      createdAt: '2026-05-30T00:00:01Z'
    }
  ]);

  // Routing navigation states
  const [currentTab, setCurrentTab] = useState<'marketplace' | 'details' | 'dashboard' | 'organizer' | 'admin' | 'scanner'>('marketplace');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Checkout modal states
  const [checkoutEventId, setCheckoutEventId] = useState<string | null>(null);
  const [checkoutTier, setCheckoutTier] = useState<TicketTier | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(1);

  // Central 30-second ticker synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setRotatingSeconds((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync role switcher to auto-tab navigation for premium evaluator UX
  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    if (newUser.role === UserRole.BUYER) {
      setCurrentTab('marketplace');
      setSelectedEventId(null);
    } else if (newUser.role === UserRole.ORGANIZER) {
      setCurrentTab('organizer');
    } else if (newUser.role === UserRole.ADMIN) {
      setCurrentTab('admin');
    }

    addAuditLog(
      newUser.id,
      newUser.email,
      'SWITCH_ROLE',
      `Swapped environment context active role to ${newUser.role}`
    );
  };

  // Helper: append newly generated Audit Logs
  const addAuditLog = (userId: string, userEmail: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Math.floor(Math.random() * 900000 + 100000)}`,
      userId,
      userEmail,
      action,
      details,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      createdAt: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Ticket purchasing success handler
  const handlePaymentSuccess = (promoCodeUsed?: string, finalTotal?: number) => {
    if (!checkoutEventId || !checkoutTier) return;

    // Create unique dynamic admittance pass instances
    const newPasses: Pass[] = [];
    const generatedCode = Math.floor(Math.random() * 90000000 + 10000000).toString();

    for (let i = 0; i < checkoutQuantity; i++) {
      const passId = `pass-${Math.floor(Math.random() * 900000 + 100000)}`;
      const singlePass: Pass = {
        id: passId,
        orderId: `ord-${Math.floor(Math.random() * 900000 + 100000)}`,
        userId: currentUser.id,
        eventId: checkoutEventId,
        ticketTierId: checkoutTier.name, // simplifies display name
        status: 'ACTIVE',
        attendeeName: currentUser.name,
        attendeeEmail: currentUser.email,
        uniqueCode: `${generatedCode}-${i + 1}`,
        createdAt: new Date().toISOString()
      };
      newPasses.push(singlePass);
    }

    // Append newly purchased passes to buyer passes list
    setPurchasedPasses((prev) => [...prev, ...newPasses]);

    // Update tickets tier `sold` counts inside Events listings
    setEvents((prevEvents) => {
      return prevEvents.map((ev) => {
        if (ev.id === checkoutEventId) {
          return {
            ...ev,
            ticketTiers: ev.ticketTiers.map((t) => {
              if (t.id === checkoutTier.id) {
                return { ...t, sold: Math.min(t.capacity, t.sold + checkoutQuantity) };
              }
              return t;
            })
          };
        }
        return ev;
      });
    });

    // Recalculate and update Organization revenue gross balance
    const matchedEv = events.find(e => e.id === checkoutEventId);
    if (matchedEv) {
      setOrganizations((prevOrgs) => {
        return prevOrgs.map((org) => {
          if (org.id === matchedEv.organizerId) {
            return { ...org, revenue: org.revenue + (finalTotal || 0) };
          }
          return org;
        });
      });
    }

    // Add Security audit log
    addAuditLog(
      currentUser.id,
      currentUser.email,
      'PURCHASE_TICKET',
      `Bought ${checkoutQuantity}x ${checkoutTier.name} passes for Event: '${matchedEv?.title}'. Total charged Rs. ${(finalTotal || 0).toLocaleString()} (Code used: ${promoCodeUsed || 'NONE'})`
    );

    // Reset Checkout modal, then jump consumer context directly to their Dashboard "Safe" to present QRs
    setCheckoutEventId(null);
    setCheckoutTier(null);
    setCurrentTab('dashboard');
  };

  // Issue payout refunds
  const handleRequestRefund = (passId: string) => {
    setPurchasedPasses((prevPasses) => {
      return prevPasses.map((p) => {
        if (p.id === passId) {
          return { ...p, status: 'REFUNDED' };
        }
        return p;
      });
    });

    // Recover Capacity
    const passObj = purchasedPasses.find(p => p.id === passId);
    if (passObj) {
      setEvents((prev) => {
        return prev.map((ev) => {
          if (ev.id === passObj.eventId) {
            return {
              ...ev,
              ticketTiers: ev.ticketTiers.map((t) => {
                const isMatch = t.name === passObj.ticketTierId; // simplifying mapping
                return isMatch ? { ...t, sold: Math.max(0, t.sold - 1) } : t;
              })
            };
          }
          return ev;
        });
      });

      addAuditLog(
        currentUser.id,
        currentUser.email,
        'REFUND_PASS',
        `Reversed event admittance pass ID: ${passId}. Escrow balance refunded to client wallet.`
      );
    }
  };

  // Submit hosted events (organizer form mapping)
  const handleCreateEvent = (newEventData: any) => {
    const orgObj = organizations.find(o => o.ownerId === currentUser.id) || organizations[0];
    const eventId = `ev-${Math.floor(Math.random() * 90000 + 10000)}`;
    
    const formattedEvent: Event = {
      id: eventId,
      ...newEventData,
      organizerId: orgObj.id,
      isFeatured: false,
      isApproved: false, // Must be approved by administrators in standard scenario
      ticketTiers: newEventData.ticketTiers.map((t: any, idx: number) => ({
        id: `tier-created-${eventId}-${idx}`,
        eventId,
        ...t,
        sold: 0
      }))
    };

    setEvents((prev) => [formattedEvent, ...prev]);

    addAuditLog(
      currentUser.id,
      currentUser.email,
      'CREATE_EVENT',
      `Created listing application for event: '${formattedEvent.title}' in ${formattedEvent.city}. Awaiting platforms approvals.`
    );
  };

  // Gatekeeping Approvals & Audits
  const handleApproveEvent = (evId: string) => {
    setEvents((prev) => {
      return prev.map((e) => (e.id === evId ? { ...e, isApproved: true } : e));
    });

    const evTitle = events.find(e => e.id === evId)?.title || 'Event';
    addAuditLog(
      currentUser.id,
      currentUser.email,
      'APPROVE_EVENT',
      `Super Admin approved event listings: '${evTitle}' for public discovery index.`
    );
  };

  const handleApproveOrganizer = (orgId: string) => {
    setOrganizations((prev) => {
      return prev.map((o) => (o.id === orgId ? { ...o, isVerified: true } : o));
    });

    const orgName = organizations.find(o => o.id === orgId)?.name || 'Organization';
    addAuditLog(
      currentUser.id,
      currentUser.email,
      'VERIFY_ORGANIZER',
      `Super Admin verified background credentials of curator: '${orgName}'`
    );
  };

  const handleProcessPayout = (payoutId: string, status: 'PROCESSED' | 'FAILED') => {
    setPayouts((prev) => {
      return prev.map((p) => (p.id === payoutId ? { ...p, status, processedAt: new Date().toISOString() } : p));
    });

    const payoutObj = payouts.find(p => p.id === payoutId);
    if (payoutObj && payoutObj.status === 'PENDING') {
      // Deduct processed payout from active organization revenue balance
      setOrganizations((prevOrgs) => {
        return prevOrgs.map((org) => {
          if (org.id === payoutObj.organizationId && status === 'PROCESSED') {
            return { ...org, revenue: Math.max(0, org.revenue - payoutObj.amount) };
          }
          return org;
        });
      });
    }

    addAuditLog(
      currentUser.id,
      currentUser.email,
      'PROCESS_PAYOUT',
      `Payout release ID: ${payoutId} updated to state: ${status}`
    );
  };

  // Register in-gate ticket scan outcomes
  const handleRegisterCheckIn = (newCheckInData: any) => {
    const checkInRecord: CheckIn = {
      id: `check-${Math.floor(Math.random() * 900000 + 100000)}`,
      scannedAt: new Date().toISOString(),
      ...newCheckInData
    };

    setCheckInLogs((prev) => [checkInRecord, ...prev]);

    // Lock ticket code as 'USED' and append to duplicate scan prevention index
    if (newCheckInData.status === 'SUCCESS') {
      setPurchasedPasses((prevPasses) => {
        return prevPasses.map((p) => {
          if (p.id === newCheckInData.passId) {
            return { ...p, status: 'USED' };
          }
          return p;
        });
      });

      // Secure duplicate protection
      setAlreadyUsedPassIds((prevSet) => {
        const nextSet = new Set(prevSet);
        nextSet.add(newCheckInData.passId);
        return nextSet;
      });

      addAuditLog(
        currentUser.id,
        currentUser.email,
        'SCAN_TICKET_SUCCESS',
        `Access Granted at entrance gates for Ticket Pass: ${newCheckInData.passId}`
      );
    } else {
      addAuditLog(
        currentUser.id,
        currentUser.email,
        'SCAN_TICKET_FAILED',
        `Access Denied at gates. Code error: ${newCheckInData.errorMessage}`
      );
    }
  };

  // Resolved routing bindings
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedEventVenue = selectedEvent ? venues.find(v => v.id === selectedEvent.venueId) : null;
  const selectedEventOrg = selectedEvent ? organizations.find(o => o.id === selectedEvent.organizerId) : null;

  return (
    <div className="min-h-screen bg-[#0A0D0A] text-slate-100 flex flex-col font-sans select-none antialiased relative">
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] sleek-glow opacity-60"></div>
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] sleek-glow opacity-40"></div>
      
      {/* Central Rotating Key Ticker Switcher */}
      <RoleSwitcher 
        currentUser={currentUser} 
        onUserChange={handleUserChange} 
        users={users} 
        rotatingSeconds={rotatingSeconds}
      />

      {/* Main SaaS App Head Navbar */}
      <header className="bg-[#0A0D0A]/85 backdrop-blur-md border-b border-emerald-500/10 py-4 px-6 sticky top-14 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo brand */}
          <div 
            onClick={() => { setCurrentTab('marketplace'); setSelectedEventId(null); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8.5 h-8.5 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-md shadow-emerald-500/20 group-hover:bg-emerald-500 transition-all">
              <span className="font-display tracking-tight block uppercase">Q</span>
            </div>
            <div>
              <strong className="text-white font-display font-extrabold tracking-widest text-lg block uppercase">Qrypt</strong>
              <span className="text-[9px] text-emerald-400 font-mono block -mt-1 uppercase tracking-tight font-semibold">Pakistan Secure Passes</span>
            </div>
          </div>

          {/* Core Tab navigations */}
          <nav className="flex items-center gap-2 md:gap-3.5">
            <button
              onClick={() => { setCurrentTab('marketplace'); setSelectedEventId(null); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                currentTab === 'marketplace' || currentTab === 'details'
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Marketplace
            </button>

            {currentUser.role === UserRole.BUYER && (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'bg-emerald-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-emerald-300" />
                <span>My Tickets ({purchasedPasses.filter(p => p.status === 'ACTIVE').length})</span>
              </button>
            )}

            {currentUser.role === UserRole.ORGANIZER && (
              <button
                onClick={() => setCurrentTab('organizer')}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  currentTab === 'organizer'
                    ? 'bg-emerald-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Organizer Dashboard</span>
              </button>
            )}

            {currentUser.role === UserRole.ADMIN && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-emerald-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-red-500" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Primary container viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Marketplace flow */}
        {currentTab === 'marketplace' && !selectedEventId && (
          <Marketplace
            events={events}
            venues={venues}
            organizations={organizations}
            onSelectEvent={(id) => { setSelectedEventId(id); setCurrentTab('details'); }}
            onNavigateToCreate={currentUser.role === UserRole.ORGANIZER ? () => setCurrentTab('organizer') : undefined}
          />
        )}

        {/* Detailed page */}
        {currentTab === 'details' && selectedEvent && selectedEventVenue && selectedEventOrg && (
          <EventDetails
            event={selectedEvent}
            venue={selectedEventVenue}
            organization={selectedEventOrg}
            onBack={() => { setSelectedEventId(null); setCurrentTab('marketplace'); }}
            onInitiateCheckout={(evId, tier, qty) => {
              setCheckoutEventId(evId);
              setCheckoutTier(tier);
              setCheckoutQuantity(qty);
            }}
          />
        )}

        {/* User Passes dashboard */}
        {currentTab === 'dashboard' && (
          <UserDashboard
            purchasedPasses={purchasedPasses}
            events={events}
            ticketTiers={events.flatMap(e => e.ticketTiers)}
            venues={venues}
            onRequestRefund={handleRequestRefund}
            rotatingSeconds={rotatingSeconds}
          />
        )}

        {/* Organizers HQ */}
        {currentTab === 'organizer' && (
          <OrganizerDashboard
            organization={organizations.find(o => o.ownerId === currentUser.id) || organizations[0]}
            events={events}
            venues={venues}
            checkInLogs={checkInLogs}
            registeredUsers={users}
            onCreateEvent={handleCreateEvent}
            onNavigateToScanner={() => setCurrentTab('scanner')}
          />
        )}

        {/* In-gate QR Validator scanner */}
        {currentTab === 'scanner' && (
          <TicketScanner
            events={events.filter(e => e.isApproved)}
            availablePasses={purchasedPasses}
            alreadyUsedPassIds={alreadyUsedPassIds}
            onRegisterCheckIn={handleRegisterCheckIn}
            onNavigateBack={() => setCurrentTab('organizer')}
          />
        )}

        {/* Global Superadmin system-wide dashboard */}
        {currentTab === 'admin' && (
          <AdminPanel
            events={events}
            organizations={organizations}
            registeredUsers={users}
            payouts={payouts}
            auditLogs={auditLogs}
            onApproveEvent={handleApproveEvent}
            onApproveOrganizer={handleApproveOrganizer}
            onProcessPayout={handleProcessPayout}
          />
        )}

      </main>

      {/* Checkout simulator modal */}
      {checkoutEventId && checkoutTier && (
        <CheckoutModal
          event={events.find(e => e.id === checkoutEventId)!}
          tier={checkoutTier}
          quantity={checkoutQuantity}
          onClose={() => { setCheckoutEventId(null); setCheckoutTier(null); }}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Footer information bar */}
      <footer className="bg-[#060806] text-slate-400 border-t border-emerald-500/10 mt-auto py-10 px-6 text-center select-none relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <p>© 2026 Qrypt Technologies (Pvt) Ltd. Karachi, Pakistan. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-slate-500">Secure Dynamic QR Attendance System • SOC2 Compliance Guided</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
