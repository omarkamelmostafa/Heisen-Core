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
      text: "text-4xl sm:text-5xl",
      spacing: "space-x-1.5"
    }
  };

  const { logo: logoSize, text: textSize, spacing } = sizeConfig[size];

  return (
    <div ref={ref} className={`flex flex-col items-center justify-center ${className}`}>
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
                  color: "#3B82F6",
                  transition: { duration: 0.2 }
                }}
                className={`
                  ${textSize}
                  font-bold tracking-tight
                  bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
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
      className="flex flex-col h- items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50"
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
        className="mb-8"
      >
        <Logo className="size-20 drop-shadow-xl" />
      </motion.div>

      {/* Enhanced Text Animation */}
      <div className="flex space-x-1 justify-center mb-6">
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
              className="text-4xl sm:text-5xl font-bold tracking-tight bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent cursor-default"
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
        className="text-gray-600 text-lg mb-8 text-center max-w-md"
      >
        {message}
      </motion.p>

      {/* Animated Progress Bar */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden"
        >
          <motion.div
            className="h-full bg-linear-to-r from-blue-500 to-purple-600 rounded-full"
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
        animate={isInView ? { opacity: 0.7 } : {}}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 text-gray-400 text-sm"
      >
        Your ultimate fantasy sports companion
      </motion.p>
    </div>
  );
}

// Simple inline variant for headers/navigation
export function CompactAnimatedLogo({ className = "" }) {
  return (
    <motion.div
      className={`flex items-center space-x-3 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <Logo className="size-8" />
      </motion.div>

      <div className="flex space-x-0.5">
        {"Fantasy Coach".split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.3 }}
            className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}