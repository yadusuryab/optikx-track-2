import { IconX, IconSearch } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface FixedSearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function FixedSearchBar({
  query,
  setQuery,
  loading,
  onSubmit,
  onReset,
  inputRef,
}: FixedSearchBarProps) {
  return (
    <div className="fixed  z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-2"
      >
        {/* Input wrapper */}
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
          <IconSearch className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Enter name or phone number…"
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
          {/* Inline clear button — only visible when there's text */}
          {query && (
            <button
              type="button"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Clear"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search button */}
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="shrink-0 gap-1.5"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Searching
            </span>
          ) : (
            "Search"
          )}
        </Button>
      </form>
    </div>
  );
}