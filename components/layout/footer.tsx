"use client";

import * as React from "react";
import { Instagram } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const instaHref =
    process.env.NEXT_PUBLIC_INSTA || "https://instagram.com/optikx.in";

  return (
    <footer className="border-t ">
      <div className="mx-auto max-w-5xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Copyright */}
        <p className="text-[11px] tracking-widest uppercase text-muted-foreground">
          © {currentYear} OPTIKX. All rights reserved.
        </p>

        {/* Right side */}
        <div className="flex items-center gap-5">

          {/* Made by Shopigo */}
          <span className="text-[11px] tracking-wide text-muted-foreground">
            Made by{" "}
            <Link
              href="https://instagram.com/getshopigo"
              target="_blank"
              rel="noopener noreferrer"
              className=" transition-colors duration-200 underline underline-offset-2"
            >
              <em>Shopigo</em>
            </Link>
          </span>

          {/* Divider */}
          <span className="text-muted-foreground select-none">|</span>

          {/* OPTIKX Instagram */}
          <Link
            href={instaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-muted-foreground hover:text-stone-800 transition-colors duration-200"
          >
            <Instagram className="w-3.5 h-3.5" />
            @optikx.in
          </Link>

        </div>
      </div>
    </footer>
  );
}

export { Footer };