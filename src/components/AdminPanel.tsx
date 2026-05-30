/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Event, Organization, User, Payout, AuditLog } from '../types.ts';
import { Shield, Sparkles, AlertOctagon, CheckSquare, Clock, Users, Building2, CheckCircle2, ShieldAlert, Cpu, ClipboardList, Trash2 } from 'lucide-react';

interface AdminPanelProps {
  events: Event[];
  organizations: Organization[];
  registeredUsers: User[];
  payouts: Payout[];
  auditLogs: AuditLog[];
  onApproveEvent: (eventId: string) => void;
  onApproveOrganizer: (orgId: string) => void;
  onProcessPayout: (payoutId: string, status: 'PROCESSED' | 'FAILED') => void;
}

export default function AdminPanel({
  events,
  organizations,
  registeredUsers,
  payouts,
  auditLogs,
  onApproveEvent,
  onApproveOrganizer,
  onProcessPayout
}: AdminPanelProps) {

  const [activeTab, setActiveTab3] = useState<'events' | 'organizers' | 'payouts' | 'audits'>('events');

  // Metrics calculations
  const totalSystemUsers = registeredUsers.length;
  const pendingEventsToApprove = events.filter(e => !e.isApproved).length;
  const pendingPayoutsToProcess = payouts.filter(p => p.status === 'PENDING').length;
  const pendingOrgsToVerify = organizations.filter(o => !o.isVerified).length;

  return (
    <div className="space-y-8 animate-fade-in pb-16 relative z-10 text-slate-200">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] text-red-500 font-extrabold font-mono uppercase block tracking-wider">PLATFORM GATEKEEPING INTERFACE</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display uppercase tracking-tight mt-0.5">
            System Admin Panel
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="bg-black/40 border border-white/5 p-1 rounded-full flex self-start lg:self-auto shrink-0">
          {(['events', 'organizers', 'payouts', 'audits'] as const).map((tab) => {
            const getPendingBadge = () => {
              if (tab === 'events') return pendingEventsToApprove;
              if (tab === 'organizers') return pendingOrgsToVerify;
              if (tab === 'payouts') return pendingPayoutsToProcess;
              return 0;
            };
            const pendingCount = getPendingBadge();

            return (
              <button
                key={tab}
                onClick={() => setActiveTab3(tab)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold capitalize cursor-pointer transition-all uppercase tracking-wider ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white font-bold shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab}</span>
                {pendingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Quick Metrics stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-[#0F111A] border p-5 rounded-3xl flex items-center gap-4 border-white/5 shadow-sm">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/15 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase tracking-wider">System Registrants</span>
            <span className="text-base font-extrabold font-mono text-white mt-0.5 block">{totalSystemUsers} Users</span>
          </div>
        </div>

        <div className="bg-[#0F111A] border p-5 rounded-3xl flex items-center gap-4 border-white/5 shadow-sm">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase tracking-wider">Pending Audits</span>
            <span className="text-base font-extrabold font-mono text-white mt-0.5 block">{pendingEventsToApprove} Events</span>
          </div>
        </div>

        <div className="bg-[#0F111A] border p-5 rounded-3xl flex items-center gap-4 border-white/5 shadow-sm">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase tracking-wider">Escrow Queue</span>
            <span className="text-base font-extrabold font-mono text-white mt-0.5 block">{pendingPayoutsToProcess} Payouts</span>
          </div>
        </div>

        <div className="bg-[#0F111A] border p-5 rounded-3xl flex items-center gap-4 border-white/5 shadow-sm">
          <div className="w-10 h-10 bg-rose-500/10 text-rose-450 border border-rose-500/15 rounded-xl flex items-center justify-center font-bold">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-mono font-bold uppercase tracking-wider">System Status</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1 mt-1 font-mono tracking-wider">
              <span>● CRYPT SECURE</span>
            </span>
          </div>
        </div>

      </div>

      {/* VIEW: MODERATE EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-[#0F111A] border rounded-[32px] p-6 border-white/5 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider">Events Approval Pipeline</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Review listing applications uploaded by organizers. Only verified and secure events populate public indexes.</p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/35 text-slate-450 font-mono text-[9px] uppercase border-b border-white/5">
                  <th className="p-3">Banner & Title</th>
                  <th className="p-3">Geography (City)</th>
                  <th className="p-3">Ticket Pricing tiers</th>
                  <th className="p-3">Approval status</th>
                  <th className="p-3 text-right">Gatekeeper Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b last:border-0 border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-3">
                      <div className="flex gap-3">
                        <img src={ev.bannerUrl} alt={ev.title} className="w-12 h-12 object-cover rounded-lg border border-white/5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-white block text-sm">{ev.title}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{ev.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 font-semibold">{ev.city}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {ev.ticketTiers.map((t) => (
                          <span key={t.id} className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 rounded px-2 py-0.5 text-[9px] font-mono whitespace-nowrap">
                            {t.name}: Rs.{t.price}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono border ${
                        ev.isApproved 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' 
                          : 'bg-rose-500/10 text-rose-450 border-rose-500/15 animate-pulse'
                      }`}>
                        {ev.isApproved ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {!ev.isApproved ? (
                        <button
                          onClick={() => onApproveEvent(ev.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-mono px-4 py-1.5 rounded-full text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 uppercase tracking-wider transition-colors"
                        >
                          <span>Approve Listing</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Approved by Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: MODERATE ORGANIZERS */}
      {activeTab === 'organizers' && (
        <div className="bg-[#0F111A] border rounded-[32px] p-6 border-white/5 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider">Curators Verification Pipeline</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Conduct background CNIC & corporate ledger validation reviews on registering event organizations.</p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/35 text-slate-450 font-mono text-[9px] uppercase border-b border-white/5">
                  <th className="p-3">Organization Name</th>
                  <th className="p-3">Geography (HQ city)</th>
                  <th className="p-3">Registered Revenue</th>
                  <th className="p-3">Verification Badge status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b last:border-0 border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-3">
                      <div className="flex gap-3">
                        <img src={org.logoUrl} alt={org.name} className="w-10 h-10 object-cover rounded-lg border border-white/5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-white text-sm">{org.name}</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">{org.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 font-semibold">{org.city}</td>
                    <td className="p-3 font-mono text-slate-300">Rs. {org.revenue.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                        org.isVerified 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/15' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/15 animate-pulse'
                      }`}>
                        {org.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {!org.isVerified ? (
                        <button
                          onClick={() => onApproveOrganizer(org.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-mono px-4 py-1.5 rounded-full text-[10px] font-bold cursor-pointer uppercase tracking-wider transition-colors"
                        >
                          Authorize Curator
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Authorized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: PROCESSING PAYOUTS */}
      {activeTab === 'payouts' && (
        <div className="bg-[#0F111A] border rounded-[32px] p-6 border-white/5 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-display tracking-wider">Escrow Withdrawals & Payouts Portal</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Release secure ticket sales funds compiled in platform safe vaults to organizers physical Pakistani bank accounts.</p>
          </div>

          {payouts.length === 0 ? (
            <p className="text-center py-10 text-slate-500 text-xs italic font-mono uppercase tracking-wider">No payout balance requests registered inside active system queues.</p>
          ) : (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-black/35 text-slate-450 font-mono text-[9px] uppercase border-b border-white/5">
                    <th className="p-3">Recipient Organization</th>
                    <th className="p-3">Settlement Amount</th>
                    <th className="p-3">Target Bank Account metadata</th>
                    <th className="p-3">Log dates</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => {
                    const matchedOrg = organizations.find(o => o.id === p.organizationId);
                    return (
                      <tr key={p.id} className="border-b last:border-0 border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="p-3">
                          <strong className="text-white block font-sans text-sm">{matchedOrg?.name || 'Curator Org'}</strong>
                          <span className="text-[9px] font-mono text-slate-500">ID: {p.organizationId}</span>
                        </td>
                        <td className="p-3 text-slate-200 font-bold font-mono">Rs. {p.amount.toLocaleString()}</td>
                        <td className="p-3 text-slate-400 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">{p.accountDetails}</td>
                        <td className="p-3 text-slate-450 font-mono">{new Date(p.requestedAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          {p.status === 'PENDING' ? (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => onProcessPayout(p.id, 'FAILED')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 font-mono px-3.5 py-1.5 rounded-full text-[9px] font-bold cursor-pointer uppercase tracking-wider transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => onProcessPayout(p.id, 'PROCESSED')}
                                className="bg-white hover:bg-slate-100 text-[#07080F] font-mono px-4 py-1.5 rounded-full text-[9px] font-extrabold cursor-pointer uppercase tracking-wider transition-colors"
                              >
                                Disburse PKR
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Processed: {p.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW: SECURITY CONTROL LOGS */}
      {activeTab === 'audits' && (
        <div className="bg-[#0c0d15] text-slate-350 border border-white/10 rounded-[32px] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Cpu className="w-4.5 h-4.5 text-blue-400" />
                <span>Qrypt System-wide Audit Log</span>
              </h3>
              <p className="text-[9px] text-slate-500 font-mono">Continuous cryptographic telemetry & transaction logs for OWASP compliance</p>
            </div>
            <span className="text-[9px] bg-red-500/10 text-red-400 border border-white/5 px-2.5 py-1 rounded-full font-mono font-bold">128-bit Shell Safe</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-[10px] pr-2 scrollbar-none">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-black/25 border border-white/5 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-450 font-bold uppercase">[{log.action}]</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300">{log.userEmail}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-sans mt-1">{log.details}</p>
                </div>

                <div className="text-right whitespace-nowrap shrink-0 text-slate-500 font-light space-y-0.5">
                  <div>IP: {log.ipAddress}</div>
                  <div>{new Date(log.createdAt).toLocaleTimeString()} PST</div>
                </div>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <p className="text-slate-500 italic text-center py-6 font-mono uppercase tracking-wider text-[10px]">No platform logs index.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
