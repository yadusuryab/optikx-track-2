'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler';
import { Info, X, Instagram } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const Header = ({ className = "" }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (isAdminRoute) return null;

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 w-full transition-all duration-300
          ${scrolled
            ? 'bg-background backdrop-blur-xl border-b border-[#e8e4de] dark:border-[#2a2720]'
            : 'bg-transparent border-b border-transparent'
          }
          ${className}
        `}
      >
        <div className="max-w-[900px] mx-auto px-6 h-[60px] grid grid-cols-3 items-center">

          {/* Left — Info button */}
          <div className="flex items-center">
            <button
              onClick={() => setIsPopupOpen(true)}
              aria-label="About"
              className="w-[34px] h-[34px] border border-[#e8e4de] dark:border-[#2a2720] flex items-center justify-center text-[#8c8680] dark:text-[#7a7570] hover:border-[#c9a96e] hover:text-[#1a1714] dark:hover:text-[#f0ece4] transition-colors duration-200"
            >
              <Info size={14} />
            </button>
          </div>

          {/* Center — Logo (truly centered via grid) */}
          <div className="flex items-center justify-center">
            <Link href="/">
              <Image
                src="/wordmark.png"
                alt="Company Logo"
                width={100}
                height={40}
                className="h-6 w-auto invert dark:invert-0 dark:saturate-0"
                priority
              />
            </Link>
          </div>

          {/* Right — Theme toggle */}
          <div className="flex items-center justify-end">
            <button
              aria-label="Toggle theme"
              className="font-mono text-sm text-muted-foreground h-[34px] px-2 border border-[#e8e4de] dark:border-[#2a2720] flex items-center justify-center hover:border-[#c9a96e] transition-colors duration-200"
            >
              <AnimatedThemeToggler />
            </button>
          </div>

        </div>
      </header>

      {/* Info Popup */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-background/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease]"
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="bg-background max-w-[400px] w-full relative p-9 pb-7 border border animate-[scaleIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 w-[30px] h-[30px] border border flex items-center justify-center  transition-colors duration-200"
              onClick={() => setIsPopupOpen(false)}
              aria-label="Close"
            >
              <X size={12} />
            </button>

            <p className="font-mono text-[9px] tracking-[0.22em] uppercase  mb-2">Legal</p>
            <h2 className="font-serif text-[28px] font-light leading-[1.1] mb-6">
              Copyright<br />Information
            </h2>

            <p className="font-mono text-[10px] tracking-[0.12em]  leading-[1.7]">
              © {new Date().getFullYear()} OPTIKX.<br />
              All rights reserved.
            </p>

            <div className="flex items-center justify-between px-4 py-3.5 bg-secondary border border-[#e8e4de] dark:border-[#2a2720] mt-4">
              <span className="font-mono text-[10px] tracking-[0.12em] ">
                Made by <em >yaduecom</em>
              </span>
              <a
                href="https://instagram.com/yaduecom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5  px-4 py-2 font-mono text-[10px] tracking-[0.14em] uppercase no-underline hover:bg-[#c9a96e] dark:hover:bg-[#c9a96e] dark:hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                <Instagram size={11} />
                @yaduecom
              </a>
            </div>

            <div className="h-px bg-primary my-5" />

            <p className="font-mono text-[9px] tracking-[0.14em]  text-center uppercase">
              Powered by yaduecom
            </p>
          </div>
      </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </>
  );
};

export default Header;