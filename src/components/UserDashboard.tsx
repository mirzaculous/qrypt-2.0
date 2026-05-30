/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Pass, Event, TicketTier, Venue } from '../types.ts';
import { generateDynamicQRToken } from '../crypto.ts';
import { Calendar, Clock, MapPin, User, ArrowRight, ShieldAlert, Cpu, Check, HelpCircle, Loader, Sparkles, LogOut, Ticket, RefreshCw, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';

interface UserDashboardProps {
  purchasedPasses: Pass[];
  events: Event[];
  ticketTiers: TicketTier[];
  venues: Venue[];
  onRequestRefund: (passId: string) => void;
  rotatingSeconds: number; // central 10-seconds ticker sync
}

/**
 * A reactive canvas wrapper that uses the installed 'qrcode' package to draw vector QR Codes dynamically.
 */
function QRCodeCanvas({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: 200,
          margin: 1.5,
          color: {
            dark: '#0f172a', // deep slate
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('QR Code render fail:', error);
        }
      );
    }
  }, [value]);

  return (
    <div className="relative p-3 bg-white border border-slate-200 rounded-3xl overflow-hidden flex items-center justify-center p-4 shadow-bold">
      <canvas ref={canvasRef} className="rounded-xl w-full max-w-[200px] h-[200px]" />
    </div>
  );
}

export default function UserDashboard({ purchasedPasses, events, ticketTiers, venues, onRequestRefund, rotatingSeconds }: UserDashboardProps) {
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [activeToken, setActiveToken] = useState<string>('');
  const [tokenPayload, setTokenPayload] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Anti-screenshot moving watermark coordinates
  const [watermarkPos, setWatermarkPos] = useState({ x: 20, y: 50 });

  // Generate a live token every time the central rotating ticks hit a boundaries or when selected ticket changes
  useEffect(() => {
    if (selectedPass) {
      const { tokenString, payload } = generateDynamicQRToken(
        selectedPass.id, 
        selectedPass.userId, 
        selectedPass.eventId
      );
      setActiveToken(tokenString);
      setTokenPayload(payload);

      // Sligtly drift watermark on each rotation to prevent static recording
      setWatermarkPos({
        x: Math.floor(Math.random() * 40 + 10),
        y: Math.floor(Math.random()
         * 50 + 25)
      });
    } else {
      setActiveToken('');
      setTokenPayload(null);
    }
  }, [selectedPass, rotatingSeconds]);

  const handleCopyToken = () => {
    if (activeToken) {
      navigator.clipboard.writeText(activeToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEventForPass = (pass: Pass) => events.find(e => e.id === pass.eventId);
  const getTierForPass = (pass: Pass) => ticketTiers.find(t => t.id === pass.ticketTierId);
  const getVenueForPass = (pass: Pass) => {
    const e = getEventForPass(pass);
    return e ? venues.find(v => v.id === e.venueId) : null;
  };

  const activePasses = purchasedPasses.filter(p => p.status === 'ACTIVE');
  const pastPasses = purchasedPasses.filter(p => p.status === 'USED' || p.status === 'REFUNDED');

  return (
    <div className="space-y-10 animate-fade-in pb-16 relative z-10">
      
      {/* Greetings block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-display uppercase tracking-tight text-white">
            My Tickets
          </h2>
          <p className="text-xs text-emerald-400 font-mono mt-0.5 uppercase tracking-wider">
            You have {activePasses.length} active event tickets • Refreshing QR system active
          </p>
        </div>
        
        {selectedPass && (
          <button
            onClick={() => setSelectedPass(null)}
            className="text-[10px] font-mono bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 px-4 rounded-full cursor-pointer uppercase border border-white/5 tracking-wider transition-all"
          >
            ← Back to Ticket List
          </button>
        )}
      </div>

      {/* Main split: left passes list, right live rotating presenter modal */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* PASS LIST - spanned 3 columns */}
        <div className="lg:col-span-3 space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-3">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span>Active Admittance Passes</span>
            </h3>

            {activePasses.length === 0 ? (
              <div className="py-14 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                  <Ticket className="w-5 h-5 animate-pulse text-emerald-400" />
                </div>
                <div className="max-w-md">
                  <h4 className="font-bold text-white font-display text-sm uppercase tracking-wider">No Active Tickets Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed leading-[1.6]">
                    Once you purchase a ticket in the Marketplace, your secure QR code tickets will appear here!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activePasses.map((pass) => {
                  const ev = getEventForPass(pass);
                  const tier = getTierForPass(pass);
                  const venue = getVenueForPass(pass);
                  const isPresented = selectedPass?.id === pass.id;

                  if (!ev) return null;

                  return (
                    <div
                      key={pass.id}
                      onClick={() => setSelectedPass(pass)}
                      className={`group border rounded-[28px] p-5.5 flex flex-col justify-between cursor-pointer transition-all h-[210px] ${
                        isPresented
                          ? 'bg-[#102a1d] border-emerald-500 text-white shadow-xl scale-[1.015]'
                          : 'bg-[#0d0f0d] hover:bg-[#121612] border-emerald-500/10 hover:border-emerald-500/25 shadow-sm'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono font-medium">
                          <span className={isPresented ? 'text-emerald-350' : 'text-slate-500'}>
                            TICKET CODE: #{pass.uniqueCode}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${isPresented ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            ACTIVE
                          </span>
                        </div>

                        <h4 className={`text-base font-extrabold font-display mt-2 group-hover:text-emerald-450 leading-snug line-clamp-2 ${isPresented ? 'text-white group-hover:text-white' : 'text-white'}`}>
                          {ev.title}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <div className={`flex items-center gap-1 text-[11px] ${isPresented ? 'text-emerald-250' : 'text-slate-400'}`}>
                          <Calendar className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          <span>{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {ev.time} PST</span>
                        </div>

                        <div className="border-t border-dashed border-white/10 pt-3 flex items-center justify-between text-xs font-semibold">
                          <div>
                            <span className={`block text-[9px] uppercase font-mono tracking-wider ${isPresented ? 'text-emerald-300' : 'text-slate-500'}`}>TIER LEVEL</span>
                            <span className="text-white">{tier?.name || 'Entry Pass'}</span>
                          </div>

                          <span className="text-[10px] uppercase font-mono tracking-widest underline decoration-2 underline-offset-2">
                            {isPresented ? 'SELECTED' : 'VIEW TICKET QR'} 
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PAST TICKETS & REQUEST REFUND LAUNCHER */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-widest border-b border-white/5 pb-3">
              <span>Event Pass Archival History</span>
            </h3>

            {pastPasses.length === 0 ? (
              <p className="text-xs text-slate-500 font-sans italic">No historical visits logged on this device.</p>
            ) : (
              <div className="bg-[#0c0d15]/85 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.03] text-slate-400 border-b border-white/5 font-mono text-[9px] uppercase tracking-widest">
                      <th className="p-4 uppercase shrink-0">Pass Details</th>
                      <th className="p-4 uppercase">Status</th>
                      <th className="p-4 uppercase">Payout refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastPasses.map((pass) => {
                      const ev = getEventForPass(pass);
                      const tier = getTierForPass(pass);
                      
                      if (!ev) return null;

                      return (
                        <tr key={pass.id} className="border-b last:border-0 border-white/5 hover:bg-white/[0.01]">
                          <td className="p-4 space-y-1">
                            <span className="font-bold text-slate-200 block">{ev.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">{tier?.name || 'Entry'} • Code #{pass.uniqueCode}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              pass.status === 'USED' 
                                ? 'bg-white/5 text-slate-400 border-white/5' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {pass.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {pass.status === 'USED' ? (
                              <span className="text-[10px] text-slate-500 font-mono">Scanned entry records verified</span>
                            ) : (
                              <span className="text-[10px] text-rose-400 font-semibold font-mono">Cancelled & Refunded</span>
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
        </div>
                {/* QR PRESENTER MODULE - spanned 2 columns */}
        <div className="lg:col-span-2 space-y-4 sticky top-24">
          
          {selectedPass ? (
            <div className="bg-[#0b0c0b] text-white rounded-[32px] p-6 border border-emerald-500/10 shadow-2xl relative overflow-hidden space-y-6 flex flex-col items-center">
              
              {/* Presenter Header */}
              <div className="w-full border-b border-emerald-500/10 pb-4 text-center space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block font-bold">VERIFIED TICKET ACCESS PASS</span>
                <h4 className="font-extrabold text-white text-base leading-tight font-display font-semibold">
                  {getEventForPass(selectedPass)?.title}
                </h4>
                <p className="text-xs text-slate-400 font-mono">Holder: {selectedPass.attendeeName}</p>
              </div>

              {/* Ticking interval clock */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="relative flex items-center justify-center">
                  {/* Outer circle layout countdown */}
                  <div className="w-16 h-16 bg-black/40 border border-emerald-500/20 rounded-full flex flex-col items-center justify-center shadow-lg relative z-10">
                    <span className="text-xl font-bold font-mono text-emerald-400">{rotatingSeconds}s</span>
                    <span className="text-[8px] text-slate-550 font-mono uppercase font-bold tracking-widest">time left</span>
                  </div>

                  {/* Breathing neon light */}
                  <div className="absolute w-20 h-20 bg-emerald-505/10 rounded-full animate-ping pointer-events-none"></div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans text-center">
                  QR code regenerates for ticket security.
                </p>
              </div>

              {/* Canvas QR Code visualization */}
              {activeToken && (
                <div className="space-y-3.5 w-full flex flex-col items-center">
                  
                  {/* Canvas block */}
                  <div className="p-4 bg-white rounded-2xl shadow-xl">
                    <QRCodeCanvas value={activeToken} />
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl max-w-xs text-center">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-[9px] text-emerald-250 font-bold font-mono uppercase leading-relaxed tracking-tight">
                      Rotates every 30 seconds. Show live QR for entry.
                    </span>
                  </div>
                </div>
              )}

              {/* Secure Specifications Panel */}
              <div className="w-full bg-black/40 rounded-2xl p-4 border border-emerald-500/10 space-y-2.5 text-[10px] font-mono select-none">
                <div className="flex justify-between border-b border-white/5 pb-1 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Ticket Details</span>
                  <span className="text-emerald-400">● Verified Active</span>
                </div>
                
                {tokenPayload && (
                  <div className="space-y-1 bg-black/50 p-2.5 text-slate-400 rounded-lg">
                    <div className="line-clamp-1">Ticket ID: <span className="text-white select-all">{tokenPayload.passId}</span></div>
                    <div className="line-clamp-1">Ref Code: <span className="text-emerald-400 font-semibold">#{selectedPass.uniqueCode}</span></div>
                    <div>Created At: <span className="text-slate-300">{new Date(tokenPayload.timestamp * 1000).toLocaleTimeString()}</span></div>
                    <div>Expires At: <span className="text-slate-300">{new Date(tokenPayload.expiry * 1000).toLocaleTimeString()}</span></div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToken}
                    className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 py-2.5 px-3 rounded-xl text-[9px] font-bold text-center cursor-pointer transition-all uppercase"
                  >
                    {copied ? '✓ Copied Ticket Details' : 'Copy Ticket Code'}
                  </button>
                  <button
                    onClick={() => onRequestRefund(selectedPass.id)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 hover:text-white border border-rose-500/20 text-rose-400 py-2.5 px-3 rounded-xl text-[9px] font-bold cursor-pointer transition-all uppercase shrink-0"
                  >
                    Cancel Ticket & Refund
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#0b0c0b]/60 rounded-3xl p-8 border border-dashed border-emerald-500/10 text-center space-y-4 py-16">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto shadow-sm">
                <Ticket className="w-6 h-6 animate-pulse" />
              </div>
              <div className="max-w-xs mx-auto space-y-1.5">
                <h4 className="font-bold text-white font-display text-sm uppercase tracking-wide">No Ticket Selected</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans leading-[1.6]">
                  Click on any of your active tickets in the left list to load your real-time secure entry QR code.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
