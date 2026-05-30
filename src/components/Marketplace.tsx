/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Event, Venue, Organization } from '../types.ts';
import { CATEGORIES, CITIES } from '../mockData.ts';
import { Search, MapPin, Calendar, Clock, Ticket, ArrowRight, Sparkles, Filter, Smile, Plus, Music, BookOpen, Presentation, Utensils, Trophy, Users, Image, Lightbulb, GraduationCap } from 'lucide-react';

interface MarketplaceProps {
  events: Event[];
  venues: Venue[];
  organizations: Organization[];
  onSelectEvent: (eventId: string) => void;
  onNavigateToCreate?: () => void;
}

// Map Lucide icons dynamically based on category metadata
const iconMap: { [key: string]: any } = {
  Music: Music,
  Smile: Smile,
  BookOpen: BookOpen,
  Presentation: Presentation,
  Utensils: Utensils,
  Trophy: Trophy,
  Users: Users,
  Image: Image,
  Lightbulb: Lightbulb,
  GraduationCap: GraduationCap,
};

export default function Marketplace({ events, venues, organizations, onSelectEvent, onNavigateToCreate }: MarketplaceProps) {
  const [selectedCity, setSelectedCity] = useState<string>('Karachi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Find lowest price helper
  const getLowestPrice = (event: Event) => {
    if (!event.ticketTiers || event.ticketTiers.length === 0) return 0;
    return Math.min(...event.ticketTiers.map(t => t.price));
  };

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // 1. Must be approved by system admins
      if (!event.isApproved) return false;

      // 2. City Filter
      if (selectedCity && event.city !== selectedCity) return false;

      // 3. Category Filter
      if (selectedCategory && event.categoryId !== selectedCategory) return false;

      // 4. Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDesc = event.description.toLowerCase().includes(query);
        const venue = venues.find(v => v.id === event.venueId);
        const matchesVenue = venue?.name.toLowerCase().includes(query);
        const org = organizations.find(o => o.id === event.organizerId);
        const matchesOrg = org?.name.toLowerCase().includes(query);

        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesOrg) {
          return false;
        }
      }

      // 5. Price filter
      const lowestPrice = getLowestPrice(event);
      if (priceFilter === 'free' && lowestPrice > 0) return false;
      if (priceFilter === 'paid' && lowestPrice === 0) return false;

      return true;
    });
  }, [events, selectedCity, selectedCategory, searchQuery, priceFilter, venues, organizations]);

  const featuredEvent = useMemo(() => {
    return events.find(e => e.isFeatured && e.city === selectedCity && e.isApproved) || events.find(e => e.isApproved);
  }, [events, selectedCity]);

  return (
    <div className="space-y-12 relative z-10">
      {/* Hero Section */}
      {featuredEvent && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[440px] flex items-center shadow-2xl border border-white/10">
          <div className="absolute inset-0 z-0">
            <img 
              src={featuredEvent.bannerUrl} 
              alt={featuredEvent.title} 
              className="w-full h-full object-cover opacity-35 filter brightness-50 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05060B] via-[#05060B]/80 to-transparent"></div>
          </div>

          <div className="relative z-10 p-8 sm:p-12 md:max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Karachi Live • Featured Event</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-white">
              {featuredEvent.title}
            </h1>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-3">
              {featuredEvent.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-mono text-slate-350">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                {new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                {featuredEvent.time} PST
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                {venues.find(v => v.id === featuredEvent.venueId)?.name || 'Local Venue'}
              </span>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => onSelectEvent(featuredEvent.id)}
                className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-full font-bold shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer group"
              >
                <span>Browse & Get Passes</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Dashboard Filters */}
      <div className="bg-[#0c0d15]/80 backdrop-blur-md rounded-[32px] p-6 lg:p-8 border border-white/5 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Main search and city selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
            <div className="relative w-full sm:w-48 shrink-0">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-blue-400 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[#131524] border border-white/10 rounded-2xl py-3 pl-10 pr-8 text-xs font-mono uppercase font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none select-custom cursor-pointer"
              >
                {CITIES.map((city) => (
                  <option key={city} value={city} className="bg-[#0c0d15] text-white">
                    {city.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search premium events, artists, venues or organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131524] border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Price tiers filter */}
          <div className="flex items-center gap-1 shrink-0 bg-[#131524] p-1 rounded-2xl border border-white/5">
            {(['all', 'free', 'paid'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPriceFilter(type)}
                className={`px-4.5 py-2.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  priceFilter === type 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Tiers' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-450" />
            <span>Refine Category</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-3 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'bg-[#131524] hover:bg-[#1a1c30] text-slate-300 border border-white/5'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => {
              const IconComp = iconMap[cat.icon] || Music;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#131524] hover:bg-[#1a1c30] text-slate-300 border border-white/5'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Events Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white uppercase">
              Discovery Ledger ({selectedCity})
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
              Secure HMAC Checkpoint active • {filteredEvents.length} Verified records
            </p>
          </div>
          
          {onNavigateToCreate && (
            <button
              onClick={onNavigateToCreate}
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-blue-400 hover:text-blue-300 font-bold cursor-pointer bg-blue-500/10 border border-blue-500/30 px-4.5 py-2.5 rounded-full hover:bg-blue-550/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Host Application</span>
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-slate-400">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-extrabold text-white text-lg font-display uppercase tracking-tight">No Verified records matched the parameters</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We couldn't find any approved events matching "{searchQuery}" matching that category in {selectedCity} inside the escrow indexes. Try resetting query keywords!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const venue = venues.find(v => v.id === event.venueId);
              const org = organizations.find(o => o.id === event.organizerId);
              const lowestPrice = getLowestPrice(event);

              return (
                <div 
                  key={event.id}
                  onClick={() => onSelectEvent(event.id)}
                  className="bg-[#0F111A] rounded-[32px] overflow-hidden border border-white/5 hover:border-blue-500/40 shadow-xl hover:shadow-blue-500/5 hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                >
                  {/* Banner image wrapper */}
                  <div className="relative aspect-video w-full bg-slate-900 shrink-0 overflow-hidden">
                    <img 
                      src={event.bannerUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-[#ffffff] text-[9px] font-mono font-bold px-3 py-1.5 rounded-full tracking-widest uppercase border border-white/5">
                      {event.categoryId.replace('cat-', '').toUpperCase()}
                    </div>
                    {event.isFeatured && (
                      <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                        FEATURED
                      </div>
                    )}
                  </div>

                  {/* Card Content details */}
                  <div className="p-6.5 flex flex-col justify-between flex-1 space-y-5">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.time}</span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-white group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug">
                        {event.title}
                      </h3>
                      
                      <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <span className="flex items-center gap-1 text-slate-350 truncate font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="truncate max-w-[140px] font-mono text-[11px]">{venue?.name || 'Local Venue'}</span>
                        </span>
                        {org && (
                          <div className="text-[10px] text-slate-500 font-sans font-medium uppercase tracking-wider">
                            Curated: {org.name}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block uppercase tracking-widest font-mono font-bold">Entry price</span>
                        <span className="text-sm font-extrabold text-emerald-450 font-mono">
                          {lowestPrice === 0 ? 'FREE' : `Rs. ${lowestPrice.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
