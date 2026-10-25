import React from 'react';

interface FlowerIconProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const FlowerIcon: React.FC<FlowerIconProps> = ({ name, imageUrl, size = 'md', className = '' }) => {
  const firstLetter = name.trim().charAt(0).toUpperCase() || '?';
  
  // Deterministic color based on name
  const colors = [
    'bg-[#B77E79]', // Rose
    'bg-[#7B8061]', // Olive
    'bg-[#92827C]', // Taupe
    'bg-[#D4A373]', // Sand
    'bg-[#A98467]', // Earth
    'bg-[#ADC178]', // Leaf
    'bg-[#6C584C]', // Bark
    'bg-[#E9EDC9]', // Cream
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const bgColor = colors[colorIndex];
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  };
  
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={name} 
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 border border-white/20 shadow-sm ${className}`} 
      />
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0 border border-white/20 ${className}`}
      title={name}
    >
      {firstLetter}
    </div>
  );
};
