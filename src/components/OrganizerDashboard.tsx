/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Event, Venue, Organization, User, CheckIn, TicketTier } from '../types.ts';
import { CATEGORIES, INITIAL_VENUES } from '../mockData.ts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
import { LayoutDashboard, Plus, Calendar, Coins, TrendingUp, Users, CheckSquare, Settings, Upload, FileText, ArrowRight, Table, ChevronRight, Activity, Bell } from 'lucide-react';

interface OrganizerDashboardProps {
  organization: Organization;
  events: Event[];
  venues: Venue[];
  checkInLogs: CheckIn[];
  registeredUsers: User[];
  onCreateEvent: (newEvent: Omit<Event, 'id' | 'organizerId' | 'isFeatured' | 'isApproved'> & { ticketTiers: Omit<TicketTier, 'id' | 'eventId' | 'sold'>[] }) => void;
  onNavigateToScanner: () => void;
}

export default function OrganizerDashboard({
  organization,
  events,
  venues,
  checkInLogs,
  registeredUsers,
  onCreateEvent,
  onNavigateToScanner
}: OrganizerDashboardProps) {

  const [activeTab, setActiveTab2] = useState<'overview' | 'events' | 'create'>('overview');
  
  // Create Event Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [city, setCity] = useState(organization.city);
  const [venueId, setVenueId] = useState(INITIAL_VENUES[0].id);
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [date, setDate] = useState('2026-07-05');
  const [time, setTime] = useState('18:00');
  const [refundPolicy, setRefundPolicy] = useState('Refunds are requested up to 48 hours prior.');
  
  // Tiers entries
  const [tierName, setTierName] = useState('General Admission');
  const [tierPrice, setTierPrice] = useState(1500);
  const [tierCapacity, setTierCapacity] = useState(500);
  const [tiers, setTiers] = useState<Omit<TicketTier, 'id' | 'eventId' | 'sold'>[]>([
    { name: 'General Admission', price: 1500, capacity: 500, description: 'Standard Entry Access' },
    { name: 'VIP Pass', price: 4500, capacity: 100, description: 'Sofa lounge seating' }
  ]);

  const handleAddTier = () => {
    if (tierName) {
      setTiers([...tiers, { name: tierName, price: tierPrice, capacity: tierCapacity, description: 'Standard Tiers' }]);
      setTierName('');
    }
  };

  const orgEvents = events.filter(e => e.organizerId === organization.id);
  
  // Calculation math metrics
  const totalTicketsSold = orgEvents.reduce((acc, ev) => {
    return acc + ev.ticketTiers.reduce((inner, t) => inner + t.sold, 0);
  }, 0);

  const totalCapacity = orgEvents.reduce((acc, ev) => {
    return acc + ev.ticketTiers.reduce((inner, t) => inner + t.capacity, 0);
  }, 0);

  const totalRevenue = orgEvents.reduce((acc, ev) => {
    return acc + ev.ticketTiers.reduce((inner, t) => inner + t.sold * t.price, 0);
  }, 0);

  const totalRealTimeCheckIns = checkInLogs.filter(log => log.status === 'SUCCESS').length;

  const attendanceRate = totalTicketsSold > 0 
    ? Math.round((totalRealTimeCheckIns / totalTicketsSold) * 100) 
    : 0;

  // Chart data simulation
  const salesTrendData = [
    { name: 'Mon', Sales: 12, Revenue: 42000 },
    { name: 'Tue', Sales: 18, Revenue: 63000 },
    { name: 'Wed', Sales: 24, Revenue: 84000 },
    { name: 'Thu', Sales: 15, Revenue: 52000 },
    { name: 'Fri', Sales: 40, Revenue: 140000 },
    { name: 'Sat', Sales: 65, Revenue: 227000 },
    { name: 'Sun', Sales: 50, Revenue: 175000 },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tiers.length === 0) {
      alert('Please configure at least one ticket tier.');
      return;
    }

    onCreateEvent({
      title,
      description,
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80',
      categoryId,
      venueId,
      date,
      time,
      city,
      terms: [
        'Must carry CNIC card match.',
        'Symmetric cryptographically rotating ticket is mandatory.'
      ],
      refundPolicy,
      faqs: [{ question: 'Is re-entry allowed?', answer: 'Re-entry requires unique scan-out validation.' }],
      ticketTiers: tiers
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setBannerUrl('');
    setTiers([
      { name: 'General Admission', price: 1500, capacity: 500, description: 'Standard Entry Access' }
    ]);
    setActiveTab2('overview');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 relative z-10 text-slate-100">
      
      {/* Dashboard Brand Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] text-blue-450 font-extrabold font-mono uppercase block tracking-widest">ORGANIZATION METRICS CONSOLE</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display uppercase tracking-tight mt-0.5">
            HQ of {organization.name}
          </h2>
        </div>

        {/* Central Scan Access Point */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToScanner}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2.5 px-5 rounded-full shadow-lg hover:shadow-emerald-550/10 cursor-pointer transition-all uppercase tracking-wider"
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Gate Scanner</span>
          </button>

          <div className="bg-white/5 p-1 rounded-full border border-white/5 flex">
            {(['overview', 'events', 'create'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab2(tab)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  activeTab === tab
                    ? 'bg-[#151725] text-white shadow-md border border-white/5'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'create' ? 'List Event' : tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW METRICS MAIN TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Card analytics metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-[#0f111a] border border-white/5 p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Tickets Sold</span>
                <Coins className="w-5 h-5 text-blue-400" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white block font-mono">{totalTicketsSold}</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">Cap limit Remaining: {totalCapacity - totalTicketsSold}</span>
              </div>
            </div>

            <div className="bg-[#0f111a] border border-white/5 p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Gross Income</span>
                <Coins className="w-5 h-5 text-emerald-450" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white block font-mono">Rs. {totalRevenue.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">Available Payout balance: Rs. {organization.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#0f111a] border border-white/5 p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Scanned In Gate entries</span>
                <CheckSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white block font-mono">{totalRealTimeCheckIns}</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-1">No-shows unregistered: {totalTicketsSold - totalRealTimeCheckIns}</span>
              </div>
            </div>

            <div className="bg-[#0f111a] border border-white/5 p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Attendance Rate</span>
                <TrendingUp className="w-5 h-5 text-[#45b6fe]" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white block font-mono">{attendanceRate}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Real-time gate speed indicators</span>
              </div>
            </div>

          </div>

          {/* charts visual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Sales Chart Area */}
            <div className="bg-[#0f111a] border border-white/5 rounded-[28px] p-6 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm font-display uppercase tracking-wide">Income Stream Trend</h4>
                <p className="text-[10px] text-slate-500 font-mono">Aggregated daily ticket transactions (Karachi, Rawalpindi hubs)</p>
              </div>

              <div className="h-64 mt-4 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3.5" stroke="#1c1f30" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="#5d6588" fontSize={9} fontStyle="mono" />
                    <YAxis stroke="#5d6588" fontSize={9} fontStyle="mono" />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', backgroundColor: '#0c0d15', border: '1px solid currentColor', color: 'white' }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Chart (Bar) */}
            <div className="bg-[#0f111a] border border-white/5 rounded-[28px] p-6 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm font-display uppercase tracking-wide">Event conversion efficiency</h4>
                <p className="text-[10px] text-slate-500 font-mono">Comparison of tickets issued vs successfully validated entries</p>
              </div>

              <div className="h-64 mt-4 w-full flex flex-col justify-between">
                
                {/* Visual mini bars */}
                <div className="space-y-4 pt-2">
                  {orgEvents.map((ev) => {
                    const ticketCount = ev.ticketTiers.reduce((inner, t) => inner + t.sold, 0);
                    const scanCount = checkInLogs.filter(cl => {
                      return cl.status === 'SUCCESS'; // Simulated event filter count
                    }).length;

                    const percent = ticketCount > 0 ? Math.round((scanCount / ticketCount) * 100) : 0;

                    return (
                      <div key={ev.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-200 truncate max-w-[200px]">{ev.title}</span>
                          <span className="font-mono text-slate-450">{scanCount} / {ticketCount} entered ({percent}% Admissions)</span>
                        </div>
                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/5">
                          <div className="bg-emerald-500 h-full rounded-full shadow-glow" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}

                  {orgEvents.length === 0 && (
                    <p className="text-xs text-slate-550 italic text-center py-10">No active events configured in dashboard context.</p>
                  )}
                </div>

                <div className="border-t border-white/5 pt-3.5 text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                  * Metrics synchronized live on any successful QR token entry validation.
                </div>
              </div>
            </div>

          </div>

          {/* Realtime Check-In Entry Logs table */}
          <div className="bg-[#0f111a] border border-white/5 rounded-[28px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div>
                <h4 className="font-bold text-white text-sm font-display uppercase tracking-wide">Interactive Admittance Auditor</h4>
                <p className="text-[10px] text-slate-500 font-mono">Live scanning streams mapped on real-time rotating cryptographic channels</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] rounded-full font-bold uppercase animate-pulse font-mono block tracking-wider">Running live syncing</span>
            </div>

            {checkInLogs.length === 0 ? (
              <p className="text-center py-10 text-slate-500 text-xs italic">No check-in logs submitted yet. Use scanner camera to register ticket entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-slate-400 font-mono text-[9px] uppercase border-b border-white/5">
                      <th className="p-3">Attendee ID / Pass</th>
                      <th className="p-3">Scanned Time</th>
                      <th className="p-3">Outcome</th>
                      <th className="p-3">Secure diagnostics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkInLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0 border-white/5 hover:bg-white/[0.01]">
                        <td className="p-3">
                          <span className="font-bold text-slate-200 block">Pass Code #{log.passId.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {log.passId}</span>
                        </td>
                        <td className="p-3 text-slate-450 font-mono">
                          {new Date(log.scannedAt).toLocaleTimeString()}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border font-mono ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-[10px] text-slate-400 font-mono">
                          {log.errorMessage || 'Verifications signature authenticated successfully'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* DETAILED HOSTED EVENTS VIEW */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 font-mono uppercase tracking-widest border-b border-white/5 pb-3">Currently CURATING EVENTS</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orgEvents.map((ev) => {
              const ticketsSold = ev.ticketTiers.reduce((sum, t) => sum + t.sold, 0);

              return (
                <div key={ev.id} className="bg-[#0f111a] border border-white/5 rounded-3xl overflow-hidden p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-white/15 transition-all">
                  <div className="flex gap-4">
                    <img src={ev.bannerUrl} alt={ev.title} className="w-20 h-20 rounded-xl object-cover border border-white/5" />
                    <div className="space-y-1">
                      <span className="text-[10px] text-blue-450 font-mono font-bold uppercase tracking-wider block">{ev.city}</span>
                      <h4 className="font-bold text-white font-display line-clamp-1 text-sm sm:text-base">{ev.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-450 shrink-0" /><span>{ev.date}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-black/20 p-3.5 rounded-2xl border border-white/5 text-center font-mono text-[10px] uppercase">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Registrations</span>
                      <strong className="text-white font-bold">{ticketsSold} tickets</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Revenue Gross</span>
                      <strong className="text-emerald-400">Rs. {ev.ticketTiers.reduce((acc, t) => acc + t.sold * t.price, 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE NEW EVENT FORM */}
      {activeTab === 'create' && (
        <form onSubmit={handleFormSubmit} className="bg-[#0f111a] border border-white/5 rounded-[32px] p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider leading-tight">Host New Pakistan Event Pass</h3>
            <p className="text-xs text-slate-450 font-mono">Fill secure onboarding details below. Instantly registers in core active listings.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Event Banner URL</label>
              <input
                type="url"
                placeholder="e.g. https://images.unsplash.com/..."
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-black/35 border border-white/10 text-white rounded-xl py-2.5 px-3.5 text-xs text-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-455 uppercase tracking-widest block">Event Title</label>
              <input
                type="text"
                placeholder="e.g. Faiz Festival qawwali"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/35 border border-white/10 text-white rounded-xl py-2.5 px-3.5 text-xs text-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Event details descriptions</label>
              <textarea
                placeholder="Describe details regarding event structure, artists lists, schedules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/35 border border-white/10 text-white rounded-xl py-2.5 px-3.5 text-xs text-white focus:ring-1 focus:ring-blue-500 h-24 whitespace-pre-line"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">City Location</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-black/35 border border-white/10 text-white rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500 text-white"
              >
                {INITIAL_VENUES.map(v => (
                  <option key={v.city} value={v.city} className="bg-slate-950 text-white">{v.city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Select Curated Venue Location</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full bg-black/35 border border-white/10 text-white rounded-xl py-2.5 px-3.5 text-xs text-white"
              >
                {INITIAL_VENUES.map(v => (
                  <option key={v.id} value={v.id} className="bg-slate-950 text-white">{v.name} ({v.city})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Launch Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/35 border border-white/10 text-white rounded-xl py-2.5 px-3.5 text-xs text-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-450 uppercase tracking-widest block">Start Time (PST)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-black/35 border border-white/10 text-white rounded-xl py-2.5 px-3.5 text-xs font-mono text-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Ticket Tiers onboarding nested form */}
          <div className="bg-[#131524] border border-[#222538] p-5.5 rounded-2xl space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider">CONFIGURING ENTRY TICKET TIERS</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Tier Name</span>
                <input
                  type="text"
                  placeholder="e.g. VIP Cushion Lounge"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="bg-black/35 border border-white/10 text-white rounded-lg p-2.5 text-xs w-full focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Price (Rs.)</span>
                <input
                  type="number"
                  placeholder="3500"
                  value={tierPrice}
                  onChange={(e) => setTierPrice(Number(e.target.value))}
                  className="bg-black/35 border border-white/10 text-white rounded-lg p-2.5 text-xs w-full font-mono focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Guest Capacity</span>
                <input
                  type="number"
                  placeholder="200"
                  value={tierCapacity}
                  onChange={(e) => setTierCapacity(Number(e.target.value))}
                  className="bg-black/35 border border-white/10 text-white rounded-lg p-2.5 text-xs w-full font-mono focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddTier}
                className="bg-blue-600 text-white w-full rounded-full py-2.5 text-xs font-semibold hover:bg-blue-500 cursor-pointer text-center sm:col-span-3 mt-2 transition-colors uppercase tracking-wider"
              >
                + Add Tier To Event Schema
              </button>
            </div>

            {/* Configured tiers output bubble labels */}
            {tiers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {tiers.map((t, idx) => (
                  <span key={idx} className="bg-black/45 border border-white/5 rounded-full px-3.5 py-1.5 text-xs font-mono text-slate-350 flex items-center gap-1.5">
                    <span>{t.name}</span>
                    <strong className="text-white">Rs. {t.price.toLocaleString()}</strong>
                    <span className="text-[9px] opacity-60">Qty: {t.capacity}</span>
                    <button type="button" onClick={() => setTiers(tiers.filter((_, i) => i !== idx))} className="text-rose-450 hover:text-rose-400 font-bold ml-1.5 focus:outline-none cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab2('overview')}
              className="bg-transparent hover:bg-white/5 text-slate-400 hover:text-white px-5 py-2.5 rounded-full text-xs font-bold transition-colors uppercase tracking-wider cursor-pointer border border-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-2.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider cursor-pointer font-display font-semibold"
            >
              Curate Event Listing
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
