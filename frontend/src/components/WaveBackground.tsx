import { motion } from 'framer-motion';

export function WaveBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] opacity-[0.04]">
        <svg
          viewBox="0 0 1440 200"
          className="absolute bottom-0 w-[200%]"
          style={{ animation: 'wave 25s linear infinite' }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,100 C320,180 440,20 720,100 C1000,180 1120,20 1440,100 L1440,200 L0,200 Z"
            fill="currentColor"
            className="text-cyan-400"
          />
        </svg>
        <svg
          viewBox="0 0 1440 200"
          className="absolute bottom-0 w-[200%]"
          style={{ animation: 'wave 30s linear infinite reverse', opacity: 0.5 }}
          preserveAspectRatio="none"
        >
          <path
            d="M0,120 C360,40 480,180 720,120 C960,60 1080,180 1440,120 L1440,200 L0,200 Z"
            fill="currentColor"
            className="text-cyan-500"
          />
        </svg>
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
          style={{
            left: `${15 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
