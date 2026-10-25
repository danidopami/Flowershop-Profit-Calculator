import React from 'react';

export const FlutedBanner: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative w-[calc(100%+3rem)] -mx-6 -mt-6 h-[26px] overflow-hidden shrink-0"
    >
      {/* Layer 1: Background with soft colored circles */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: '#746C64',
          backgroundImage: `
            radial-gradient(circle at 20% 50%, #c9806f 0%, transparent 50%),
            radial-gradient(circle at 50% -10%, #a3ad87 0%, transparent 60%),
            radial-gradient(circle at 85% 60%, #e2b19d 0%, transparent 45%)
          `
        }}
      />

      {/* Layer 2: The fluted glass effect (Reeded Glass) */}
      <div 
        className="absolute inset-0 backdrop-blur-[5px] saturate-[1.15]"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, 
            rgba(255, 255, 255, 0.30) 0px, 
            rgba(255, 255, 255, 0.06) 11px, 
            rgba(0, 0, 0, 0.10) 22px, 
            rgba(255, 255, 255, 0.26) 24px
          )`,
          WebkitBackdropFilter: 'blur(5px) saturate(1.15)'
        }}
      />

      {/* Layer 3: Bottom edge gradient melt */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, transparent 13px, #746C64 26px)'
        }}
      />
    </div>
  );
};
