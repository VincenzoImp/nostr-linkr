"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/lookup", label: "Lookup" },
  { href: "/batch", label: "Batch" },
  { href: "/events", label: "Events" },
  { href: "/verify", label: "Verify" },
  { href: "/link", label: "Link" },
  { href: "/contract", label: "Contract" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-bold text-lg text-violet-400 hover:text-violet-300 transition-colors">
          nostr-linkr
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                pathname === link.href
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
