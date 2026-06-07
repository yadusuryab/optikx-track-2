import { useTheme } from "next-themes";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconInfoCircle } from "@tabler/icons-react";

interface SearchHeroProps {
  query: string;
  setQuery: (value: string) => void;
  loading: boolean;
  fieldError: string;
  setFieldError: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function SearchHero({
  query,
  setQuery,
  loading,
  fieldError,
  setFieldError,
  onSubmit,
  inputRef
}: SearchHeroProps) {
  const { theme } = useTheme();
  const shadowColor = theme === "dark" ? "white" : "black";
  
  return (
    <>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] skew-y-12"
        )}
      />
      
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div>
          <h1 className="text-5xl leading-none font-semibold tracking-tighter text-balance sm:text-6xl md:text-7xl lg:text-8xl">
            Find
            <LineShadowText className="italic" shadowColor={shadowColor}>
              Order
            </LineShadowText>
          </h1>
        </div>
        <p
          className="afu d2"
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--stone)",
            margin: 0
          }}
        >
          Enter your phone number
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <form
          onSubmit={onSubmit}
          className="rounded-md flex justify-between items-center bg-background/10 border saturate-200 backdrop-blur-2xl w-full px-2 pl-4 py-3"
        >
          <div>
            <div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                className="focus:outline-none"
                placeholder="YOUR PHONE NUMBER"
                onChange={e => {
                  setQuery(e.target.value);
                  setFieldError("");
                }}
              />
            </div>
            {fieldError && <div className="error-msg">{fieldError}</div>}
          </div>
          <Button type="submit" disabled={loading || !query.trim()}>
            <span>Track</span>
          </Button>
        </form>
      </div>

      <div
        className="afu d4"
        style={{ maxWidth: 480, margin: "0 auto 40px", textAlign: "center" }}
      >
        <div className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
          <IconInfoCircle size={15} /> Orders appear within 48 hours of confirmation
        </div>
      </div>
    </>
  );
}