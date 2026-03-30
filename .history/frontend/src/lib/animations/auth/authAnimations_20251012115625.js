// lib/animations/authAnimations.js

// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  out: {
    opacity: 0,
    y: 50,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};

// Container variants for staggered children
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Item variants for individual elements
export const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};

// Success state variants
export const successVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.2,
    },
  },
};

// Form container variants (for forms with staggered fields)
export const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Icon animation variants
export const iconVariants = {
  hidden: {
    scale: 0.5,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.3,
      type: "spring",
      stiffness: 200,
    },
  },
};

// Slide in from left variants
export const slideInLeftVariants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Slide in from right variants
export const slideInRightVariants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Fade in up variants
export const fadeInUpVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Scale in variants
export const scaleInVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Staggered list variants
export const staggeredListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Quick fade in for help text and secondary elements
export const quickFadeInVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Pre-configured motion props for common elements
export const motionProps = {
  page: {
    initial: "initial",
    animate: "in",
    exit: "out",
    variants: pageVariants,
  },
  container: {
    initial: "hidden",
    animate: "visible",
    variants: containerVariants,
  },
  formContainer: {
    initial: "hidden",
    animate: "visible",
    variants: formContainerVariants,
  },
  item: {
    variants: itemVariants,
  },
  success: {
    initial: "hidden",
    animate: "visible",
    variants: successVariants,
  },
  icon: {
    initial: "hidden",
    animate: "visible",
    variants: iconVariants,
  },
};

// Helper function to create staggered delays
export const createStaggerDelay = (index, baseDelay = 0.1) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: baseDelay + index * 0.1,
      duration: 0.4,
    },
  },
});
