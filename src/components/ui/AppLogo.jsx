import { cn } from "@/lib/utils";

export default function AppLogo({ size = "md", className }) {
  const sizes = {
    sm: { container: "h-9 w-9", bubble: "h-6 w-6", clock: "h-2.5 w-2.5" },
    md: { container: "h-10 w-10", bubble: "h-7 w-7", clock: "h-3 w-3" },
    lg: { container: "h-12 w-12", bubble: "h-8 w-8", clock: "h-3.5 w-3.5" },
  };
  
  const s = sizes[size] || sizes.md;

  return (
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative",
      s.container,
      className
    )}>
      {/* Chat bubble */}
      <svg 
        viewBox="0 0 24 24" 
        fill="white"
        className={s.bubble}
      >
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
      {/* Tiny clock inside */}
      <div className={cn(
        "absolute bg-emerald-500 rounded-full flex items-center justify-center",
        s.clock
      )}
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-full h-full p-0.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6v6l4 2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}