/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Event, Venue, Organization, TicketTier } from '../types.ts';
import { ChevronLeft, Calendar, Clock, MapPin, ShieldAlert, Award, ArrowRight, HelpCircle, FileText, Heart, Compass, CheckCircle } from 'lucide-react';

interface EventDetailsProps {
  event: Event;
  venue: Venue;
  organization: Organization;
  onBack: () => void;
  onInitiateCheckout: (eventId: string, selectedTier: TicketTier, quantity: number) => void;
}

export default function EventDetails({ event, venue, organization, onBack, onInitiateCheckout }: EventDetailsProps) {
  const [selectedTierId, setSelectedTierId] = useState<string>(event.ticketTiers[0]?.id || '');
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const selectedTier = event.ticketTiers.find(t => t.id === selectedTierId);

  return (
    <div className="space-y-8 animate-fade-in pb-12 relative z-10">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-300 hover:text-white cursor-pointer bg-white/5 hover:bg-white/10 py-2.5 px-4 rounded-full transition-all border border-white/5 uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Event Center</span>
        </button>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex items-center gap-1.5 text-xs py-2.5 px-4 rounded-full font-mono font-bold transition-all cursor-pointer uppercase tracking-wider ${
            isSaved
              ? 'bg-rose-500/10 text-rose-450 border border-rose-500/25'
              : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-550 text-rose-400' : ''}`} />
          <span>{isSaved ? 'SAVED' : 'FAVORITE'}</span>
        </button>
      </div>

      {/* Main Multi-Column Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns - Content Description & Metadata */}
        <div className="lg:col-span-2 space-y-8">
          {/* Banner Hero Card */}
          <div className="relative rounded-[32px] overflow-hidden aspect-video bg-white/5 border border-white/10 shadow-2xl">
            <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

          {/* Core Info Headers */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3.5xl font-extrabold tracking-tight text-white leading-tight font-display uppercase">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm py-4 border-y border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center font-bold border border-blue-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">DATE</span>
                  <span className="font-semibold text-white">
                    {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center font-bold border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">TIME</span>
                  <span className="font-semibold text-white">{event.time} PST</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center font-bold border border-purple-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">LOCATION</span>
                  <span className="font-semibold text-white">{venue.name} • {venue.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display uppercase tracking-widest">
              <Award className="w-4 h-4 text-blue-400" />
              <span>About the Event</span>
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line leading-[1.65]">
              {event.description}
            </p>
          </div>

          {/* Beautiful Google Maps Simulation */}
          <div className="bg-[#0F111A] border border-white/5 rounded-[28px] p-6 space-y-4">
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Venue Location Map</h4>
            <div className="bg-black/30 border border-white/5 w-full h-48 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
              {/* Fake grid network lines to simulate vector map */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>
              
              {/* Visual simulated pins */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="bg-blue-600 rounded-full p-2.5 text-white animate-bounce shadow-lg ring-4 ring-blue-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="bg-[#0c0d15]/95 border border-white/10 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[9px] uppercase font-mono mt-1.5 whitespace-nowrap shadow-md">
                  {venue.name}
                </div>
              </div>

              {/* Map Coordinates block */}
              <div className="absolute bottom-3 left-3 bg-[#0c0d15]/90 backdrop-blur-md border border-white/5 rounded-lg p-2 text-[9px] font-mono shadow-sm">
                <span className="text-slate-500 block uppercase">Coordinates</span>
                <span className="text-slate-200 font-bold">{venue.coordinates.lat.toFixed(4)}°N, {venue.coordinates.lng.toFixed(4)}°E</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{venue.address}</span>
            </p>
          </div>

          {/* Organizer Info Row */}
          <div className="bg-[#0f111a] border border-white/5 rounded-2xl p-6 flex items-start gap-4">
            <img src={organization.logoUrl} alt={organization.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-white text-sm sm:text-base font-display">{organization.name}</h4>
                {organization.isVerified && (
                  <span className="bg-blue-500/10 text-blue-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-blue-500/20 uppercase tracking-wider">
                    <CheckCircle className="w-2.5 h-2.5 fill-blue-500 text-[#0f111a]" />
                    <span>VERIFIED ORGANIZER</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                {organization.description}
              </p>
            </div>
          </div>

          {/* Terms & Refund Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            <div className="space-y-3 bg-red-550/10 p-5 rounded-2xl border border-red-500/20 text-red-200">
              <h4 className="text-xs sm:text-sm font-bold font-mono text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Security Rules & Terms</span>
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 leading-relaxed">
                {event.terms.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <h4 className="text-xs sm:text-sm font-bold font-sans text-white flex items-center gap-1.5 font-display uppercase tracking-wider">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Cancel & Refund Policy</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed leading-[1.6]">
                {event.refundPolicy}
              </p>
              <div className="text-[9px] text-slate-500 italic font-mono pt-2 block uppercase tracking-wide">
                Processed automatically via Qrypt instant escrow wallets.
              </div>
            </div>
          </div>

          {/* Dynamic FAQs */}
          {event.faqs && event.faqs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-display uppercase tracking-widest">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="space-y-3">
                {event.faqs.map((faq, idx) => (
                  <details key={idx} className="group bg-[#0F111A] border border-white/5 rounded-2xl p-4 cursor-pointer transition-colors [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between font-bold text-white text-sm list-none outline-none font-display">
                      <span>{faq.question}</span>
                      <span className="transition group-open:rotate-180 -translate-y-px text-slate-500">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Widget - Ticket Purchasing Gate */}
        <div className="sticky top-24 space-y-6">
          <div className="bg-[#0F111A] text-white rounded-[32px] p-6 border border-white/10 shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] text-blue-450 font-bold font-mono block uppercase tracking-widest font-mono">TICKET BUYING GATEWAY</span>
              <h3 className="text-lg font-bold font-display uppercase tracking-tight mt-1">Select Ticket Tiers</h3>
            </div>

            {/* Selector Grid of Tiers */}
            <div className="space-y-2.5">
              {event.ticketTiers.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                const progressRemaining = Math.max(0, 100 - (tier.sold / tier.capacity) * 100);
                const isSoldOut = tier.sold >= tier.capacity;

                return (
                  <button
                    key={tier.id}
                    onClick={() => !isSoldOut && setSelectedTierId(tier.id)}
                    className={`w-full text-left p-4.5 rounded-2xl flex flex-col gap-2 transition-all border outline-none cursor-pointer ${
                      isSoldOut 
                        ? 'bg-[#0c0d15]/50 border-white/5 text-slate-600 opacity-50 cursor-not-allowed'
                        : isSelected
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                          : 'bg-[#131524] border-white/5 text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-sm block tracking-wide">{tier.name}</span>
                        {tier.description && (
                          <span className={`text-[10px] mt-1 block leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {tier.description}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs sm:text-sm font-bold block shrink-0">
                        {tier.price === 0 ? 'FREE' : `Rs. ${tier.price.toLocaleString()}`}
                      </span>
                    </div>

                    {/* Progress Bar remaining visual */}
                    <div className="w-full space-y-1.5 pt-1.5">
                      <div className="flex items-center justify-between text-[9px] font-mono uppercase opacity-75">
                        <span>Sold: {tier.sold}/{tier.capacity} passes</span>
                        <span>{isSoldOut ? 'SOLD OUT' : `${Math.round(progressRemaining)}% Left`}</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-white' : 'bg-blue-500'}`}
                          style={{ width: `${(tier.sold / tier.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quantity Selector Counter */}
            {selectedTier && (
              <div className="flex items-center justify-between gap-4 py-3 border-y border-white/5">
                <span className="text-xs font-mono text-slate-400 uppercase">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center border border-white/10 cursor-pointer text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold w-4 text-center">{ticketQuantity}</span>
                  <button
                    onClick={() => setTicketQuantity(Math.min(5, ticketQuantity + 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center border border-white/10 cursor-pointer text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Live Pricing Summary & Checkout Button */}
            {selectedTier && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Rate ({ticketQuantity}x)</span>
                  <span className="font-semibold">Rs. {(selectedTier.price * ticketQuantity).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Digital Service Tax (5%)</span>
                  <span className="font-semibold">Rs. {(selectedTier.price * ticketQuantity * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
                  <span className="font-semibold text-slate-400">Total Price</span>
                  <span className="text-base font-extrabold text-blue-400 font-mono">
                    Rs. {(selectedTier.price * ticketQuantity * 1.05).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onInitiateCheckout(event.id, selectedTier, ticketQuantity)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-5 rounded-full font-bold flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer text-xs uppercase shadow-lg shadow-blue-500/10 group mt-2 tracking-wider"
                >
                  <span>Proceed to secure Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
