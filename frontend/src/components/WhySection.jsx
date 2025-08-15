import Revenue from "../assets/icons/Revenue.svg";
import Time from "../assets/icons/Time.svg";
import Cost from "../assets/icons/Cost.svg";
import Workflow from "../assets/icons/Workflow.svg";
import Star from '../assets/icons/Star.svg';

const ITEMS = [
  {
    icon: Revenue,
    title: "Revenue Growth",
    body: "Increase your project capacity and overall profitability.",
  },
  {
    icon: Time,
    title: "Time Efficiency",
    body:
      "Reduce planning times significantly and free up resources for more strategic initiatives.",
  },
  {
    icon: Cost,
    title: "Cost Savings",
    body:
      "Minimize manual planning costs, enabling a leaner and more efficient workflow.",
  },
  {
    icon: Workflow,
    title: "Integrated Workflows",
    body:
      "Collaborate seamlessly across departments for consistent project success.",
  },
];

export default function Why() {
  return (
    <section id="why" className="relative bg-[#0b0b0b] text-white py-24 min-h-screen flex flex-col items-center justify-center">
      <div className="mx-auto max-w-6xl px-6 w-full flex flex-col items-center">
        {/* Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 backdrop-blur-sm">
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
            <span className="text-[12.5px] leading-none text-white/70">
              Why Veilix?
            </span>
            <img src={Star} alt="star" className="h-3 w-3 opacity-60" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-center text-[28px] leading-tight font-semibold tracking-[-0.01em] mt-4">
          Unlock the Future of Engineering:
          <span className="block">
            Efficiency, Growth and Seamless Collaboration
          </span>
        </h2>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-4 gap-8">
          {ITEMS.map((item) => (
            <div
              key={item.title}
              className="
                group relative rounded-[22px] border border-white/10
                bg-white/[0.02] p-8
                transition-all duration-300 transform-gpu
                hover:-translate-y-1.5 hover:shadow-[0_10px_40px_rgba(255,255,255,0.06)]
                hover:border-white/20
                after:content-[''] after:absolute after:inset-0 after:rounded-[22px]
                after:border after:border-white/10 after:[border-style:dashed]
                after:pointer-events-none after:opacity-60
              "
            >
              {/* subtle hover glow */}
              <div className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-1 rounded-[24px] blur-[16px] bg-white/[0.03]" />
              </div>

              {/* Icon badge */}
              <div className="mb-6">
                <div className="relative h-20 w-20">
                  {/* icon */}
                  <img
                    src={item.icon}
                    alt=""
                    className="absolute inset-0 m-auto h-36 w-36 transition-transform duration-300 group-hover:scale-[1.03]"
                    draggable="false"
                  />
                </div>
              </div>

              {/* Title + body resized for balance */}
              <h3 className="text-[22px] font-semibold leading-snug">{item.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-white/60 max-w-[300px]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
