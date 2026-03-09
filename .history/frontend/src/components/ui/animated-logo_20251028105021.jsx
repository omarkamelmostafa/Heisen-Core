// frontend/src/components/ui/animated-logo.jsx
'use client';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { Logo } from './logo';

export function AnimatedLogo({
  size = "lg",
  showText = true,
  animateOnView = true,
  className = ""
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const sizeConfig = {
    sm: {
      logo: "size-8",
      text: "text-lg",
      spacing: "space-x-0.5"
    },
    md: {
      logo: "size-12",
      text: "text-2xl",
      spacing: "space-x-1"
    },
    lg: {
      logo: "size-16",
      text: "text-3xl sm:text-4xl",
      spacing: "space-x-1"
    },
    xl: {
      logo: "size-20",
      text: "text-4xl sm:text-5xl md:text-6xl",
      spacing: "space-x-1.5"
    }
  };

  const { logo: logoSize, text: textSize, spacing } = sizeConfig[size];

  return (
    <div ref={ref} className={`flex h-full flex-col items-center justify-center ${className}`}>
      {/* Animated Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={animateOnView ? (isInView ? { scale: 1, rotate: 0 } : {}) : { scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          duration: 0.8
        }}
        whileHover={{
          scale: 1.05,
          rotate: 5,
          transition: { type: "spring", stiffness: 400 }
        }}
        className="mb-4"
      >
        <Logo className={`${logoSize} drop-shadow-lg`} />
      </motion.div>

      {/* Animated App Name */}
      {showText && (
        <div className={`flex ${spacing} justify-center`}>
          <AnimatePresence>
            {"Fantasy Coach".split('').map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={animateOnView ? (isInView ? { opacity: 1, y: 0 } : {}) : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                className={`
                  ${textSize}
                  font-bold tracking-tight
                  text-slate-900
                  cursor-default
                `}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Full Page Loading Variant
export function AnimatedLogoLoader({
  message = "Loading your fantasy experience...",
  showProgress = true
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4"
    >
      {/* Main Logo with Enhanced Animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 1
        }}
        className="mb-6 sm:mb-8"
      >
        <Logo className="size-16 sm:size-20 md:size-24 drop-shadow-lg" />
      </motion.div>

      {/* Enhanced Text Animation */}
      <div className="flex space-x-1 justify-center mb-6 sm:mb-8">
        <AnimatePresence>
          {"Fantasy Coach".split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.07,
                ease: "backOut"
              }}
              whileHover={{
                y: -4,
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 cursor-default"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Message */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="text-slate-600 text-base sm:text-lg md:text-xl text-center max-w-md mb-6 sm:mb-8"
      >
        {message}
      </motion.p>

      {/* Animated Progress Bar */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="w-48 sm:w-64 md:w-80 bg-slate-200 rounded-full h-1.5 sm:h-2 overflow-hidden"
        >
          <motion.div
            className="h-full bg-slate-600 rounded-full"
            initial={{ x: "-100%" }}
            animate={isInView ? { x: "100%" } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}

      {/* Subtle Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.6 } : {}}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-4 sm:bottom-8 text-slate-400 text-sm text-center px-4"
      >
        Your ultimate fantasy sports companion
      </motion.p>
    </div>
  );
}