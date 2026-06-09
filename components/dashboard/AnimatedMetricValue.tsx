"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export function AnimatedMetricValue({ value }: { value: string | number }) {
  const numeric = typeof value === "number" ? value : Number(String(value).replace("%", ""));
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (!Number.isFinite(numeric)) return String(value);
    const suffix = String(value).includes("%") ? "%" : "";
    return `${Math.round(latest)}${suffix}`;
  });

  useEffect(() => {
    if (!Number.isFinite(numeric)) return;
    const controls = animate(count, numeric, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [count, numeric]);

  if (!Number.isFinite(numeric)) return <strong>{value}</strong>;
  return <motion.strong>{rounded}</motion.strong>;
}
