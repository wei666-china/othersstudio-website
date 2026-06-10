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
    </nav>
  );
}
