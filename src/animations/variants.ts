import type { Variants } from "framer-motion";

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: "easeIn" } }
};

export const cardRevealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } }
};

export const timelineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

export const scanAnimationVariants: Variants = {
  idle: { opacity: 0.72 },
  scanning: { opacity: 1, transition: { repeat: Infinity, repeatType: "reverse", duration: 0.9 } },
  complete: { opacity: 1 }
};

export const counterVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } }
};
