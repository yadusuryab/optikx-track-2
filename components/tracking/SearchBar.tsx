import { IconSearch, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SearchBarProps {
  search: string;
  setSearch: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  loading: boolean;
  clearSearch: () => void;
}

export function SearchBar({ search, setSearch, handleSearch, loading, clearSearch }: SearchBarProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full px-4"
    >
      <div className="text-center mb-8">
        <img src="/logo.png" alt="Logo" className="h-12 mx-auto mb-6" />
        <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-2">Track Your Order</h1>
        <p className="text-muted-foreground text-sm">Enter your details to locate your shipment in real-time.</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="relative flex items-center bg-background border shadow-sm rounded-full p-1.5 focus-within:ring-2 ring-primary/20 transition-all duration-300 backdrop-blur-md">
          <IconSearch className="ml-4 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, or address..."
            className="flex-1 bg-transparent border-0 px-4 py-2 focus:outline-none text-base placeholder:text-muted-foreground/60"
          />
          {search && (
            <button type="button" onClick={clearSearch} className="p-2 hover:bg-muted rounded-full">
              <IconX className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          <Button 
            type="submit" 
            disabled={loading || !search}
            className="rounded-full px-6 py-5 font-medium transition-all"
          >
            {loading ? "Searching..." : "Track"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}