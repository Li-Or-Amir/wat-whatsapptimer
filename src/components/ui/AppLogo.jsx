import { cn } from "@/lib/utils";

export default function AppLogo({ size = "md", className }) {
  const sizes = {
    sm: { container: "h-9 w-9", clock: "h-3 w-3" },
    md: { container: "h-10 w-10", clock: "h-3.5 w-3.5" },
    lg: { container: "h-12 w-12", clock: "h-4 w-4" },
  };
  
  const s = sizes[size] || sizes.md;

  return (
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative",
      s.container,
      className
    )}>
      {/* Enlarged round chat bubble (like Messages icon) */}
      <svg 
        viewBox="0 0 24 24" 
        fill="white"
        className="h-[80%] w-[80%]"
      >
        <circle cx="12" cy="10" r="9" />
        <path d="M7 17l3-3h6" fill="white" />
      </svg>
      {/* Tiny clock inside */}
      <div className={cn(
        "absolute flex items-center justify-center",
        s.clock
      )}
      style={{ top: '38%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" className="w-full h-full">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}