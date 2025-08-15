import Analyse from "../assets/icons/Analyse.svg";
import Design from "../assets/icons/Design.svg";
import Develop from "../assets/icons/Develop.svg";
import Support from "../assets/icons/Support.svg";
import Star from '../assets/icons/Star.svg';

const ITEMS = [
  {
    icon: Analyse,
    title: "Analysis & Strategy",
    body: "Understand client needs and craft a bespoke AI-driven solution..",
  },
  {
    icon: Develop,
    title: "Development & Testing",
    body:
      "Employ agile methodologies to create reliable, robust solutions.",
  },
  {
    icon: Design,
    title: "Design & Mockup",
    body:
      "Develop interactive prototypes to ensure alignment with project goals.",
  },
  { 
    icon: Support,
    title: "Launch & Support",
    body:
      "Deliver continuous updates and optimizations post-launch",
  }

];

export default function Why() {
  return (
    <section id="process" className="relative bg-[#0b0b0b] text-white py-24 min-h-screen flex flex-col items-center justify-center">
      <div className="mx-auto max-w-6xl px-6 w-full flex flex-col items-center">
        {/* Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
            <span className="text-[16px] leading-none text-white/70">
              Our Process
            </span>
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-[34px] leading-tight font-semibold tracking-[-0.01em] mt-4">
          Strategize, Prototype, Build, Succeed: 
          <span className="block">
            Our Process, Your Results.
          </span>

        </h2>

        {/* Cards */}
        <div className="mt-10 grid grid-rows-2 grid-cols-2 gap-8">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="
                group relative rounded-[15px] border border-white/10
                bg-white/[0.02] p-7 flex flex-row items-center gap-12
                transition-all duration-300 transform-gpu
                hover:-translate-y-1.5 hover:shadow-[0_10px_40px_rgba(255,255,255,0.06)]
                hover:border-white/20
                after:content-[''] after:absolute after:inset-0 after:rounded-[15px]
                after:border after:border-white/10 after:[border-style:dashed]
                after:pointer-events-none after:opacity-60
              "
            >
              {/* subtle hover glow */}
              <div className="pointer-events-none absolute inset-0 rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-1 rounded-[24px] blur-[16px] bg-white/[0.03]" />
              </div>

              {/* Icon badge (left) */}
              <div className="flex-shrink-0">
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt=""
                    className="h-44 w-44 transition-transform duration-300 group-hover:scale-[1.03]"
                    draggable="false"
                  />
                </div>
              </div>

              {/* Title + body (right) */}
              <div>
                <h3 className="text-[26px] font-semibold leading-snug">{item.title}</h3>
                <p className="mt-2.5 text-[16px] leading-relaxed text-white/60 max-w-[300px]">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
