import React, { useEffect, useState } from "react";
import veilixlogo from "../assets/Logo.svg";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#why", label: "Why" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#process", label: "Process" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-[background,backdrop-filter] duration-300
        ${scrolled ? "bg-[rgb(14,14,14)]/90 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" : "bg-[rgb(14,14,14)]"}`}
      role="banner"
    >
      <div className="mx-auto max-w-[1200px] h-16 px-5 flex items-center relative">
        {/* Left: Logo + Wordmark */}
        <a
          href="#hero"
          className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
        >
          <img src={veilixlogo} alt="Veilix" className="h-8 w-auto" />
        </a>

        {/* Center: Nav links */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right: Contact pill */}
        <div className="ml-auto">
          <a
            href="mailto:parvez.rumi@veilix.ai"
            className="rounded-full border border-[rgb(183,183,183)] px-4 py-2 text-xs font-light
                       text-white/90 hover:bg-white hover:text-black transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
}
