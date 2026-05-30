/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, UserRole } from '../types.ts';
import { Shield, Sparkles, User as UserIcon, Building2, ShieldAlert, Cpu } from 'lucide-react';

interface RoleSwitcherProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  users: User[];
  rotatingSeconds: number;
}

export default function RoleSwitcher({ currentUser, onUserChange, users, rotatingSeconds }: RoleSwitcherProps) {
  return (
    <div className="bg-[#080908]/95 backdrop-blur-md border-b border-emerald-500/10 text-slate-300 py-3 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Dynamic Core indicator */}
        <div className="flex items-center gap-2.5">
          <div className="p-1 px-3 bg-emerald-600/10 border border-emerald-500/30 rounded-full flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 shadow-lg select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>QR REFRESH: {rotatingSeconds}s</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans hidden lg:block font-medium">
            Dynamic QR codes refresh every 30 seconds. This blocks ticket copying or screenshots.
          </p>
        </div>

        {/* Persona Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1">Current User Role:</span>
          {users.map((u) => {
            const isActive = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onUserChange(u)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {u.role === UserRole.BUYER && <UserIcon className="w-3.5 h-3.5 text-emerald-400" />}
                {u.role === UserRole.ORGANIZER && <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                {u.role === UserRole.ADMIN && <Shield className="w-3.5 h-3.5 text-red-500" />}
                <span>{u.name.split(' (')[0]}</span>
                <span className="text-[9px] opacity-75 font-mono hidden sm:inline px-1 bg-black/40 rounded uppercase font-semibold text-slate-300">
                  {u.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
