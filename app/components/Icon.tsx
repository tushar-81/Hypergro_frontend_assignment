import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 16 }) => {
  const IconComponent = (LucideIcons as any)[name];
  
  if (!IconComponent) {
    return <LucideIcons.HelpCircle className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
};
