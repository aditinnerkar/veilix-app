export default function BeyondWave({ onClick, className = "" }) {
  return (
    <div className={`w-full flex justify-center ${className}`}>
      <div
        className="
          w-full max-w-[760px]
          rounded-2xl border border-black/10
          px-6 py-5
          text-black/90
          shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
          bg-[linear-gradient(90deg,rgba(255,255,255,0.96),rgba(245,245,245,0.96))]
        "
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg md:text-xl font-semibold">
            Think. Beyond the wave.
          </p>

          <button
            type="button"
            onClick={onClick}
            className="
              shrink-0 rounded-full px-4 py-2
              bg-black text-white text-sm font-medium
              border border-black/80
              hover:bg-black/90 transition-colors
            "
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
