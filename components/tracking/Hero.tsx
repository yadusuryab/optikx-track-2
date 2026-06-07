import { cn } from "@/lib/utils";
import { Zalando_Sans_SemiExpanded } from "next/font/google";
import { AnimatedShinyText } from "../ui/animated-shiny-text";
import { ArrowRightIcon, Package } from "lucide-react";
import { TypingAnimation } from "../ui/typing-animation";
const zando = Zalando_Sans_SemiExpanded({
  weight: ["600"],
  subsets: ["latin"],
});
export function Hero() {
  return (
    <div className="py-10 text-center relative overflow-hidden">
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
      linear-gradient(to right, rgba(120,113,108,0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(120,113,108,0.06) 1px, transparent 1px)
    `,
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 50%, black 20%, transparent 100%)",
        }}
      />

      {/* Eyebrow pill */}
     

      <div
        className={cn(
          "group w-fit mx-auto mb-2 rounded-full border  border-black/5 bg-neutral-100 text-sm text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        )}
      >
        <AnimatedShinyText className="inline-flex gap-2 items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
        <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full border border-border/60 bg-background">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/45" />
        </span>
          <span>Order Tracking</span>
          <Package className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
      {/* Headline */}
      <h1
        className={`text-2xl text-muted-foreground leading-none m-0 inline-block whitespace-nowrap ${zando.className}`}
      >
        Where is your
        <span> <TypingAnimation
          words={["Order?","Package?"]}
          cursorStyle="line"
          loop
          className="text-foreground"
        /></span>
      </h1>

      <style>{`
  @keyframes shimmer {
    from { background-position: 250% center; }
    to   { background-position: -250% center; }
  }
`}</style>

      {/* Subtext */}
      <p
        className="mt-1 text-[10px] tracking-[0.26em] uppercase text-muted-foreground/55"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        Enter your phone number
      </p>

      {/* Diamond ornament */}
    </div>
  );
}
