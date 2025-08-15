import React, { useEffect, useRef } from "react";
import { motion, useAnimationControls, useInView } from "framer-motion";
import Backdrop from "./backdrop";

export default function Hero() {
  const sectionRef = useRef(null);
  const controls = useAnimationControls();
  const inView = useInView(sectionRef, { amount: 0.3 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const SPOT = 420; // diameter in px

    const start = () => {
      const w = el.getBoundingClientRect().width;
      controls.start({
        x: [-SPOT, w + SPOT],     // from off-screen left to off-screen right
        opacity: [0, 1, 1, 0],
        transition: {
          duration: 5,
          ease: "easeInOut",
          times: [0, 0.1, 0.9, 1],
          repeat: Infinity,
        },
      });
    };

    if (inView) start();
    else controls.stop();

    const onResize = () => inView && start();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [controls, inView]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen bg-black text-white overflow-hidden flex items-center justify-center"
    >
      <Backdrop fullHeight />

      {/* 🔧 Spotlight is now a direct child of the section and anchored to left:0 */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-10 rounded-full"
        initial={false}
        animate={controls}
        style={{
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 45%, transparent 100%)",
          mixBlendMode: "lighten",
          filter: "blur(14px)",
          willChange: "transform, opacity",
        }}
      />

      {/* Content */}
      <div className="relative z-20 text-center max-w-3xl mx-auto px-6 space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-sm">
          <span className="text-white/60 text-sm leading-none">•</span>
          <span className="text-[16px] leading-none text-white/70">
            Sneak peek of solution we are building
          </span>
          <span className="text-white/60 text-sm leading-none">•</span>
          <a
            href="https://www.linkedin.com/company/veilix-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[14px] leading-none text-white/90 hover:text-white underline underline-offset-4 decoration-white/40"
            aria-label="Learn more (opens in a new tab)"
          >
            Learn More
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 13l6-6M13 7H7m6 0v6" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        <div className="relative w-full flex flex-col items-center gap-8">
          <h1 className="text-[#E7E7E7] text-[40px] md:text-[40px] font-semibold leading-tight">
            Empowering Engineering with our <br />
            GenAI-Driven <br />
            Precision Applications
          </h1>

          <p className="text-lg md:text-lg text-white/70 max-w-3xl mx-auto">
            Revolutionizing technical planning with intelligent AI solutions,
            enabling efficiency, innovation, and compliance across industries.
          </p>

          <div>
            <button
              className="bg-white text-black px-6 py-2 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors"
              onClick={() => (window.location.href = "mailto:parvez.rumi@veilix.ai")}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Bottom arrow scoped to hero */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center">
        <a href="#why" aria-label="Scroll to next section" className="text-white/80 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce motion-reduce:animate-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
