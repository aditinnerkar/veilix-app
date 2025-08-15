export default function Backdrop({ className = "", fullHeight = false }) {
    return (
      <div
        className={
          // base container with flexible height options
          `absolute inset-0 overflow-hidden bg-[#0b0b0b] ${className}`
        }
      >
        {/* Base gradient for smoother transitions - more subtle and darker */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0f0f0f] to-[#0E0E0E]" />
  
        {/* Broad, soft dark troughs (sets the column rhythm) - exact gradient pattern */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#0D0D0D_0_20px,#0C0C0C_20px_25px,#0B0B0B_25px_30px,#070707_30px_35px,#040404_35px_50px)]" />
  
        {/* Very thin highlight ridges (gloss on the fold edges) - adjusted for broader columns */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0_5px,rgba(255,255,255,0)_5px_50px)]" />
  
        {/* Top-right subtle shadow for balance */}
        <div className="absolute -right-16 -top-16 w-[35vw] h-[35vw] rounded-full pointer-events-none
                        bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0)_70%)]" />
      </div>
    );
  }
  