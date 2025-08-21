export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0b0b] text-white">
      <hr className="border-white/10 py-5" />

      <div className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-12 gap-10">
          {/* Navigation */}
          <div className="col-span-4">
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-base">
              <li><a href="#why" className="text-white/70 hover:text-white">Why</a></li>
              <li><a href="#about" className="text-white/70 hover:text-white">About</a></li>
              <li><a href="#services" className="text-white/70 hover:text-white">Services</a></li>
              <li><a href="#process" className="text-white/70 hover:text-white">Process</a></li>
              <li><a href="#chat" className="text-white/70 hover:text-white">AI Chat</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-5">
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="text-base">
              <div className="mb-3">
                <div className="text-white/50">Mail</div>
                <a
                  href="mailto:parvez.rumi@veilix.ai"
                  className="text-white/80 hover:text-white"
                >
                  parvez.rumi@veilix.ai
                </a>
              </div>
              <div>
                <div className="text-white/50">Address</div>
                <div className="text-white/80 leading-relaxed">
                  Sepapaja tn 6,<br />
                  15551 Tallinn,<br />
                  Harju Maakond, Estonia
                </div>
              </div>
            </div>
          </div>

          {/* Socials */}
          <div className="col-span-3">
            <h4 className="text-lg font-semibold mb-4">Socials</h4>
            <ul className="space-y-2 text-base">
              <li>
                <a
                  href="https://www.linkedin.com/company/veilix-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* bottom note */}
        <div className="mt-10 text-sm italic text-white/50">
          © {year} Veilix AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
