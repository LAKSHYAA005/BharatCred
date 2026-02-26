import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp } from 'lucide-react';

const BharatLoading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer Glowing Rings */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-32 h-32 rounded-full border border-[#FFC107]/20 shadow-[0_0_50px_rgba(255,193,7,0.1)]"
        />
        
        {/* The Central Logo Animation */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center w-24 h-24 bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <motion.img
            src="/logo.png"
            alt="BharatCred"
            className="w-16 h-16 object-contain"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Small "Scanning" Beam */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#00E676] to-transparent"
          />
        </motion.div>

        {/* Floating "Credit Assets" icons */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-48 h-48"
        >
          <ShieldCheck className="absolute top-0 left-1/2 -translate-x-1/2 text-white/20 w-6 h-6" />
          <TrendingUp className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white/20 w-6 h-6" />
        </motion.div>
      </div>

      {/* Progress Text */}
      <div className="mt-12 text-center">
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg font-medium tracking-[0.2em] uppercase"
        >
          Analyzing Financial DNA
        </motion.p>
        <p className="text-white/40 text-sm mt-2 font-light">
          Extracting behavioral patterns from statement...
        </p>
      </div>
    </div>
  );
};

export default BharatLoading;
