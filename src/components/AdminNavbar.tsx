// Administrative Dashboard Navigation Bar (Bauhaus Theme)
// Location: src/components/AdminNavbar.tsx

'use client';

import Link from 'next/link';
import { LogOut, ArrowLeft, Database } from 'lucide-react';

interface AdminNavbarProps {
  onLogout?: () => void;
  isAuthenticated: boolean;
}

export default function AdminNavbar({ onLogout, isAuthenticated }: AdminNavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-brand-surface border-b-4 border-brand-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary p-1.5 border border-brand-on-surface hidden sm:block">
              <Database className="h-4 w-4 text-brand-on-primary" />
            </div>
            <span className="font-display font-black text-sm md:text-base tracking-tighter uppercase text-brand-on-surface">
              NASA HERITAGE HUNT
            </span>
            <span className="font-mono text-[9px] font-black bg-brand-mustard text-brand-on-surface px-2.5 py-0.5 border-2 border-brand-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] uppercase tracking-wider">
              ADMIN CONTROL
            </span>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-brand-on-surface text-[10px] uppercase font-mono font-bold tracking-wider bg-brand-surface hover:bg-brand-surface-low transition shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)]"
            >
              <ArrowLeft className="h-3 w-3" />
              Public View
            </Link>
            {isAuthenticated && onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-brand-error text-brand-error text-[10px] uppercase font-mono font-bold tracking-wider bg-brand-surface hover:bg-red-50 transition shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(28,27,27,1)] cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
