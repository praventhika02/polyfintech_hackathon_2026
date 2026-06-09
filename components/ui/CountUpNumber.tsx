"use client";

import { useEffect, useState } from "react";

export function CountUpNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    let raf = 0;
    const total = 42;
    const tick = () => {
      frame += 1;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setDisplay(Math.round(value * Math.min(eased, 1)));
      if (frame < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display}{suffix}</>;
}
