import React from "react";
import Backdrop from "./backdrop";

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen text-white flex items-center justify-center relative bg-black">
      <Backdrop fullHeight={true} />
      
      <div className="text-center max-w-2xl mx-auto px-6 relative z-10 space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-white/60 text-sm leading-none">•</span>
          <span className="text-[13px] leading-none text-white/70">
            Sneak peek of solution we are building
          </span>
          <span className="text-white/60 text-sm leading-none">•</span>
          <a
            href="https://www.linkedin.com/company/veilix-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[13px] leading-none text-white/90 hover:text-white underline underline-offset-4 decoration-white/40"
            aria-label="Learn more (opens in a new tab)"
          >
            Learn More
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M7 13l6-6M13 7H7m6 0v6" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {/* Main heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-4xl font-bold leading-tight">
            Empowering Engineering with our 
            GenAI-Driven Precision Applications
          </h1>
        </div>

        {/* Description */}
        <div className="space-y-6">
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Revolutionizing technical planning with intelligent AI solutions, 
            enabling efficiency, innovation, and compliance across industries.        
          </p>
        </div>
        
        {/* CTA Button */}
        <div className="pt-4">
          <button className="bg-white text-black px-6 py-2 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors" onClick={() => window.location.href = 'mailto:parvez.rumi@veilix.ai'}>
            Get Started
          </button>
        </div>
      </div>

      {/* Bottom-center hovering arrow */}
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center">
        <a
            href="#why" /* can change target */
            aria-label="Scroll to next section"
            className="text-white/80 hover:text-white"
        >
            <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 animate-bounce motion-reduce:animate-none"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            >
            <path d="M6 9l6 6 6-6" />
            </svg>
        </a>
        </div>

    </section>
  );
}
