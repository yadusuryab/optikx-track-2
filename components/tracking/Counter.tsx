import { useEffect, useState } from "react";

interface CounterProps {
  value: number;
}

export function Counter({ value }: CounterProps) {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{display}</span>;
}