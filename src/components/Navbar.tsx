"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/thoughts", label: "思考" },
    { href: "/updates", label: "动态" },
    { href: "/#product", label: "产品" },
    { href: "/#team", label: "团队" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 px-6 md:px-15 py-4 flex items-center justify-between backdrop-blur-xl bg-bg/88 border-b border-brown-light/15 transition-all">
      <Link
        href="/"
        className="font-serif text-2xl font-bold text-brown-deep tracking-tight no-underline"
      >
        DAY<span className="font-light text-brown-warm ml-1">1</span>
      </Link>

      <div className="flex items-center gap-9">
        <ul className="hidden md:flex gap-9 list-none">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`no-underline text-sm font-medium tracking-wide transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[1.5px] after:bg-brown-deep after:transition-all after:duration-300 ${
                  pathname === link.href
                    ? "text-brown-deep font-semibold after:w-full"
                    : "text-brown-mid hover:text-brown-deep after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/me/developer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] border-brown-light text-sm font-medium text-brown-deep no-underline hover:border-brown-deep hover:bg-brown-deep/3 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          开发者
        </Link>
      </div>
    </nav>
  );
}
