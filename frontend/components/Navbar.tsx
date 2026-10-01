'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, PlusCircle, LogIn, LogOut } from 'lucide-react';

export interface NavbarProps {
  className?: string;
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ className = '', transparent = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Audited per prompt: 'Discover' removed as duplicate of 'Explore'
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore', href: '/problems' },
    { label: 'Report', href: '/report' },
    { label: 'Activity', href: '/my-activity' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const shadowStyle = transparent ? { textShadow: '0 1px 3px rgba(0,0,0,0.6)' } : undefined;

  return (
    <header
      className={`w-full z-50 transition-colors ${
        transparent
          ? 'bg-transparent border-b border-white/10'
          : 'sticky top-0 bg-[#faf8f4]/95 dark:bg-[#0e1512]/95 backdrop-blur-md border-b border-[#e5e1d8] dark:border-[#24312b]'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: ProblemPulse Logo + Name */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <span
              className={`font-heading text-xl font-bold tracking-tight ${
                transparent ? 'text-white' : 'text-[#14201c] dark:text-[#ece9e1]'
              }`}
              style={shadowStyle}
            >
              ProblemPulse
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={shadowStyle}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? transparent
                        ? 'text-[#5cc9a0] bg-white/15 font-semibold shadow-2xs'
                        : 'text-[#0f6b4f] dark:text-[#5cc9a0] bg-[#0f6b4f]/10 dark:bg-[#5cc9a0]/10 font-semibold'
                      : transparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] hover:bg-[#ede8dc]/50 dark:hover:bg-[#1a2520]/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Auth / Action Buttons */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/25 text-[#5cc9a0] border border-emerald-500/40 hover:bg-emerald-500/35 transition-colors"
                    style={shadowStyle}
                    title="Open Municipal Admin Dashboard"
                  >
                    <span>Municipal Admin</span>
                  </Link>
                )}
                <span
                  className={`text-xs font-medium max-w-[120px] truncate ${
                    transparent ? 'text-white/90' : 'text-[#5d6b65] dark:text-[#9aa8a1]'
                  }`}
                  style={shadowStyle}
                >
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    transparent
                      ? 'text-rose-300 hover:text-rose-100 hover:bg-rose-950/40'
                      : 'text-[#c8371d] dark:text-[#ff8a70] hover:text-[#a52a14] hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  }`}
                  style={shadowStyle}
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={shadowStyle}
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  transparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1] hover:bg-[#ede8dc]/50 dark:hover:bg-[#1a2520]/50'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f6b4f] hover:bg-[#0b543d] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all border border-[#5cc9a0]/30"
              style={shadowStyle}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Problem</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/report"
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#0f6b4f] text-white text-xs font-semibold shadow-xs"
            >
              Report
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                transparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-[#14201c] dark:text-[#ece9e1] hover:bg-[#ede8dc] dark:hover:bg-[#1f2b25]'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t px-4 pt-3 pb-5 space-y-2 ${
            transparent
              ? 'bg-black/90 backdrop-blur-md border-white/10 text-white'
              : 'border-[#e5e1d8] dark:border-[#24312b] bg-[#faf8f4] dark:bg-[#0e1512]'
          }`}
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'text-[#0f6b4f] dark:text-[#5cc9a0] bg-[#0f6b4f]/10 dark:bg-[#5cc9a0]/10 font-semibold'
                    : transparent
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-[#5d6b65] dark:text-[#9aa8a1] hover:text-[#14201c] dark:hover:text-[#ece9e1]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div
            className={`pt-3 border-t space-y-2 ${
              transparent ? 'border-white/10' : 'border-[#e5e1d8] dark:border-[#24312b]'
            }`}
          >
            {user ? (
              <div className="flex items-center justify-between px-3.5 py-2">
                <span className="text-sm font-medium">
                  Signed in as <strong className="text-[#5cc9a0]">{user.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-rose-300 hover:text-rose-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-[#14201c] dark:text-[#ece9e1] hover:bg-[#ede8dc] dark:hover:bg-[#1a2520]'
                }`}
              >
                Sign In
              </Link>
            )}

            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f6b4f] text-white font-semibold text-sm shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report a Problem</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
