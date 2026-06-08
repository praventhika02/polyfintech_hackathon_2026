"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function WelcomeBanner({ name, show }: { name: string; show: boolean }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) return;
    const timer = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="notice"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ marginBottom: 18 }}
        >
          Welcome back, {name}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
