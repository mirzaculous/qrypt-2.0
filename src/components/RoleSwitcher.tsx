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
    <div className="bg-[#05060B]/95 backdrop-blur-md border-b border-white/5 text-slate-300 py-3 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Dynamic Core indicator */}
        <div className="flex items-center gap-2.5">
          <div className="p-1 px-3 bg-blue-600/10 border border-blue-500/30 rounded-full flex items-center gap-1.5 text-[11px] font-mono font-bold text-blue-400 shadow-lg select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>CORE KEY REFRESH: {rotatingSeconds}s</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans hidden lg:block font-medium">
            Symmetric JWT token keys rotating on 10s cycles. Anti-screenshot verification layers primed.
          </p>
        </div>

        {/* Persona Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mr-1">Sandbox Persona:</span>
          {users.map((u) => {
            const isActive = currentUser.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onUserChange(u)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-550/30 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {u.role === UserRole.BUYER && <UserIcon className="w-3.5 h-3.5 text-emerald-400" />}
                {u.role === UserRole.ORGANIZER && <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                {u.role === UserRole.ADMIN && <Shield className="w-3.5 h-3.5 text-red-400" />}
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
