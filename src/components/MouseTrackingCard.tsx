import { ReactNode } from 'react';
import { useMouseTracker } from '@/hooks/use-mouse-tracker';
import { cn } from '@/lib/utils';

interface MouseTrackingCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export const MouseTrackingCard = ({ 
  children, 
  className, 
  intensity = 1 
}: MouseTrackingCardProps) => {
  const { mousePosition, elementRef } = useMouseTracker();

  return (
    <div
      ref={elementRef}
      className={cn(
        "transition-transform duration-300 ease-out",
        className
      )}
      style={{
        transform: `translate(${mousePosition.x * intensity}px, ${mousePosition.y * intensity}px) scale(${1 + Math.abs(mousePosition.x + mousePosition.y) * 0.001})`,
      }}
    >
      {children}
    </div>
  );
};