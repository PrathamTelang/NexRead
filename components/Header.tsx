"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiOutlineBookOpen } from "react-icons/hi2";
import { LuMoon, LuSun } from "react-icons/lu";

export default function Header() {

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="section">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
  <HiOutlineBookOpen className="h-4 w-4 text-zinc-400" />
</div>
            </div>

            <span className="text-sm font-medium tracking-tight">
              NexRead
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#features"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Workflow
            </a>

            <a
              href="#library"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Library
            </a>
          </nav>
          </div>
        </div>
    </header>
  );
}