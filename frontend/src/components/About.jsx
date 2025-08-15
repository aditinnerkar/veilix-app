import Star from '../assets/icons/Star.svg'



export default function About() {

  return (
    <section id="about" className="relative bg-[#0b0b0b] text-white py-24 min-h-screen flex flex-col items-center justify-center">
      <div className="mx-auto max-w-6xl px-6 grid grid-cols-12 gap-12 items-center w-full">
        {/* Left: Copy */}
        <div className="col-span-7">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
            <span className="text-[16px] leading-none text-white/75">About Us</span>
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-[34px] leading-tight font-semibold tracking-[-0.01em]">
            Redefining Engineering Excellence with
            <br /> AI-Driven Innovation and Insights
          </h2>

          {/* Paragraphs */}
          <p className="mt-5 text-white/75 max-w-[56ch] text-lg">
            Veilix is a forward-thinking startup combining the power of Generative AI with
            advanced analytics to deliver transformative solutions for engineering and
            technical domains.
          </p>

          <p className="mt-4 text-white/75 max-w-[56ch] text-lg">
            Our mission is to bridge the gap between traditional technical diagrams and
            actionable insights, driving efficiency and innovation.
          </p>

            <p className="mt-4 text-white/75 max-w-[56ch] text-lg">
              Tailor-made industry-specific AI solutions<br />
              Expertise in P&amp;ID digitization and intelligent analytics<br />
              Scalable user-friendly platforms for modern engineering
            </p>
        </div>

        {/* Right: Stacked cards in a dashed container */}
        <div className="col-span-4 py-2">
          <div className="relative rounded-[22px] p-4">
            {/* dashed container border */}
            <div className="pointer-events-none absolute inset-0 rounded-[22px] border border-white/10 opacity-90 [border-style:dashed]" />

            <div className="flex flex-col gap-4">
              {['Gen-AI', 'Engineering', 'Automation', 'Transformation'].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="
                    rounded-xl bg-[#D1D1D1] text-black px-2 py-2 text-[26px] font-large
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                    transition-transform duration-200 transform-gpu hover:-translate-y-[2px]
                    border border-black/10
                    whitespace-nowrap
                  "
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
