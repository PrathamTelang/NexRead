'use client'

import Link from 'next/link'
import { HiOutlineBookOpen } from 'react-icons/hi2'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="section">
        <div className="flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
              <HiOutlineBookOpen className="h-4 w-4 text-zinc-400" />
            </div>

            <span className="text-sm font-medium">
              NexRead
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link
              href="#features"
              className="transition-colors hover:text-zinc-200"
            >
              Features
            </Link>

            <Link
              href="#how-it-works"
              className="transition-colors hover:text-zinc-200"
            >
              Workflow
            </Link>

            <Link
              href="#book-search-input"
              className="transition-colors hover:text-zinc-200"
            >
              Library
            </Link>
          </div>
        </div>

        <div className="border-t border-white/[0.06] py-6">
          <p className="text-center text-xs text-zinc-500">
            © {currentYear} NexRead. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}