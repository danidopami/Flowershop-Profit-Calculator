import React from 'react';

interface SoleliaLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SoleliaLogo: React.FC<SoleliaLogoProps> = ({
  className = '',
  showText = false,
  size = 'md',
}) => {
  const imageHeights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-12',
    lg: 'h-16 sm:h-20',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/assets/aistudio/Solelia_Logo_a5167299.png"
        alt="Soleliá"
        className={`${imageHeights[size]} w-auto object-contain shrink-0`}
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-title text-lg sm:text-xl font-bold tracking-wider text-[#5d3a3a] uppercase"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Soleliá
          </span>
          <span className="text-[10px] text-[#7c6363] tracking-widest uppercase font-medium mt-0.5">
            Tiệm Hoa Nghệ Thuật
          </span>
        </div>
      )}
    </div>
  );
};
