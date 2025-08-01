import { X, Heart } from "lucide-react";

interface SwipeOverlayProps {
  direction: 'left' | 'right' | null;
  opacity: number;
}

export function SwipeOverlay({ direction, opacity }: SwipeOverlayProps) {
  if (!direction) return null;

  const isLeft = direction === 'left';
  const isRight = direction === 'right';

  return (
    <div 
      className={`absolute inset-0 rounded-3xl flex items-center justify-center transition-opacity duration-200 ${
        isLeft ? 'bg-red-500/10' : 'bg-green-500/10'
      }`}
      style={{ opacity }}
    >
      <div className={`p-4 rounded-full ${
        isLeft ? 'bg-red-500' : 'bg-green-500'
      } shadow-lg transform scale-110`}>
        {isLeft ? (
          <X className="w-8 h-8 text-white" />
        ) : (
          <Heart className="w-8 h-8 text-white" />
        )}
      </div>
      
      <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full ${
        isLeft ? 'bg-red-500' : 'bg-green-500'
      } shadow-lg`}>
        <span className="text-white font-semibold text-lg">
          {isLeft ? 'Skip' : 'Saved!'}
        </span>
      </div>
    </div>
  );
}