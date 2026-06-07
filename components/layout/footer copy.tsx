"use client";

import * as React from "react";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { Button } from "../ui/button";

function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch categories on component mount
  
  // Get first 5 categories or default ones if none available

  // Fallback categories if none are fetched



  // Link declarations - organize all links here
  const footerLinks = {
    help: [
      { label: "CONTACT US", href: "/contact" },
      // { label: "SHIPPING INFO", href: "/shipping" },
      // { label: "RETURNS", href: "/returns" },
      // { label: "SIZE GUIDE", href: "/size-guide" }
    ],
    company: [
      { label: "ABOUT US", href: "/about" }
    ],
  
    legal: [
      { label: "PRIVACY POLICY", href: "/privacy-policy" },
      { label: "TERMS & CONDITIONS", href: "/terms" },
      { label: "COOKIES", href: "/cookies" }
    ],
    social: [
      { label: "INSTAGRAM", href: process.env.NEXT_PUBLIC_INSTA || "#" },
      { label: "WHATSAPP", href: process.env.NEXT_PUBLIC_WHATSAPP || "#" },
      // { label: "LINKEDIN", href: process.env.NEXT_PUBLIC_LINKEDIN || "#" },
      // { label: "TIKTOK", href: process.env.NEXT_PUBLIC_TIKTOK || "#" },
      // { label: "PINTEREST", href: process.env.NEXT_PUBLIC_PINTEREST || "#" }
    ]
  };

  return (
    <footer className="bg-[#f5f5f5] text-black border-t border-gray-200">
      {/* Marquee Bar */}
      <div className="bg-black text-white py-3 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content animate-marquee whitespace-nowrap">
            <span className="font-montserrat font-bold text-sm uppercase tracking-widest mx-8">
              LATEST PREMIUM COLLECTIONS
            </span>
            <span className="font-montserrat font-bold text-sm uppercase tracking-widest mx-8">
            TRENDING WATCH COLLECTIONS
            </span>
            <span className="font-montserrat font-bold text-sm uppercase tracking-widest mx-8">
            TRENDZO COLLECTIONS
            </span>
           
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 text-center">
          <Link href="/">
            <h2 className="font-serif text-primary italic text-4xl md:text-5xl font-semibold tracking-wide hover:opacity-80 transition-opacity">
              Trendzo
            </h2>
            {/* <Brand/> */}
          </Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-4xl mx-auto">
          {/* HELP Column */}
          <div>
            <h3 className="font-montserrat font-medium text-sm uppercase tracking-widest mb-6">
              HELP
            </h3>
            <div className="space-y-3">
              {footerLinks.help.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block font-montserrat text-xs text-gray-600 uppercase tracking-wide hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* COMPANY Column */}
          <div>
            <h3 className="font-montserrat font-medium text-sm uppercase tracking-widest mb-6">
              COMPANY
            </h3>
            <div className="space-y-3">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block font-montserrat text-xs text-gray-600 uppercase tracking-wide hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* SHOP BY CATEGORY - Dynamic */}
         

          {/* INSTAGRAM */}
          <div>
            <h3 className="font-montserrat font-medium text-sm uppercase tracking-widest mb-6">
              INSTAGRAM
            </h3>
            <div className="space-y-4">
              <p className="font-montserrat text-xs text-gray-600 uppercase tracking-wide">
                FOLLOW TRENDZO
              </p>
              <div className="flex flex-col space-y-3">
                <Link href={footerLinks.social[0].href}>
                  <Button className="w-full font-montserrat text-xs uppercase tracking-wide border border-black bg-transparent text-black hover:bg-black hover:text-white transition-colors duration-300 py-3">
                    <Instagram className="w-4 h-4 mr-2" />
                    FOLLOW
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Bar */}
      <div className="bg-black text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            <span className="font-montserrat font-medium text-xs uppercase tracking-widest">
              CONNECT
            </span>
            {footerLinks.social.map((platform) => (
              <Link
                key={platform.label}
                href={platform.href}
                className="font-montserrat text-xs uppercase tracking-widest hover:text-gray-300 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {platform.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="font-montserrat text-xs text-gray-600 uppercase tracking-wide">
              © {currentYear} {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
            </p>
            <nav className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-montserrat text-xs text-gray-600 uppercase tracking-wide hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .marquee-container {
          overflow: hidden;
          white-space: nowrap;
          position: relative;
        }
        .marquee-content {
          display: inline-flex;
          animation: marquee 20s linear infinite;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </footer>
  );
}

export { Footer };