import { useState, useEffect } from 'react';

const CreditGauge = ({ score = 300, showScore = true, decorative = false }) => {
  const [animatedScore, setAnimatedScore] = useState(300);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (decorative) return; // Skip animation for decorative mode

    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60 FPS
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentScore = Math.round(300 + (score - 300) * easeOutQuart);
      
      setAnimatedScore(currentScore);

      if (frame === totalFrames) {
        clearInterval(counter);
        setIsAnimating(false);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [score, decorative]);

  // Calculate rotation angle based on score (300-900 range)
  // -90deg is leftmost (300), 90deg is rightmost (900)
  const normalizedScore = Math.max(300, Math.min(900, animatedScore));
  const rotation = ((normalizedScore - 300) / 600) * 180 - 90;

  // Determine color based on score
  const getScoreColor = (s) => {
    if (s >= 750) return 'text-green-500';
    if (s >= 650) return 'text-yellow-500';
    return 'text-red-500';
  };

  const progress = (normalizedScore - 300) / 600;
  
  const pathStyle = decorative ? undefined : {
    strokeDasharray: '1',
    strokeDashoffset: 1 - progress
  };

  const pathClassName = decorative ? 'animated-gauge-fill' : '';

  // 1. CHANGED: Removed translateX(-50%) to fix the rotation pivot synchronization
  const needleStyle = decorative ? undefined : {
    transform: `rotate(${rotation}deg)`
  };

  // 2. CHANGED: Adjusted bottom for perfect vertical alignment with the center dot, moved down by 2mm
  const needleClass = decorative 
    ? 'absolute bottom-[calc(0.5rem-2mm)] left-1/2 w-1.5 h-34 origin-bottom -translate-x-1/2 sweeping-needle z-10 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]'
    : 'absolute bottom-[calc(0.8rem-4mm)] left-1/2 w-1.5 h-34 origin-bottom -translate-x-1/2 transition-transform duration-100 ease-out z-10 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[380px] h-[190px] overflow-visible">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <path
            d="M10,45 A40,40 0 0,1 90,45"
            fill="none"
            stroke="#2a2a2a"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M10,45 A40,40 0 0,1 90,45"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength={decorative ? undefined : "1"}
            className={pathClassName}
            style={pathStyle}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF1744" />
              <stop offset="50%" stopColor="#FFC107" />
              <stop offset="100%" stopColor="#00E676" />
            </linearGradient>
          </defs>
        </svg>

        <div 
          className={needleClass}
          style={needleStyle}
        >
        </div>

        {/* 3. CHANGED: Replaced the two misaligned circles with a single perfectly centered circle */}
        <div className="absolute bottom-[-6mm] left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20" />
      </div>
      
      {!decorative && showScore && (
        <div className="mt-4 text-center">
          <div className={`text-6xl font-extrabold ${getScoreColor(animatedScore)} transition-colors duration-300`}>
            {animatedScore}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Credit Score</div>
        </div>
      )}
    </div>
  );
};

export default CreditGauge;