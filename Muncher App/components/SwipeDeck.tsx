import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { X, Heart, RotateCcw, Sliders, User } from "lucide-react";
import { Button } from "./ui/button";
import { RestaurantCard } from "./RestaurantCard";
import { Restaurant, mockRestaurants } from "../data/mockRestaurants";

interface SwipeDeckProps {
  onMatch: (restaurant: Restaurant) => void;
  onSkip: (restaurant: Restaurant) => void;
  onFiltersClick: () => void;
  onFavoritesClick: () => void;
  onViewDetails: (restaurant: Restaurant) => void;
  onProfileClick?: () => void;
  userFilters?: any;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  favoritesCount: number;
}

export function SwipeDeck({ onMatch, onSkip, onFiltersClick, onFavoritesClick, onViewDetails, onProfileClick, userFilters, currentIndex, onIndexChange, favoritesCount }: SwipeDeckProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const swipeOpacity = useTransform(x, [-150, -50, 0, 50, 150], [1, 0, 0, 0, 1]);
  const swipeOpacityValue = useTransform(x, [-50, 50], [1, 1], { clamp: false });

  // Reset motion values when index changes
  useEffect(() => {
    x.set(0);
    setSwipeDirection(null);
    setIsAnimating(false);
  }, [currentIndex, x]);

  const currentRestaurant = restaurants[currentIndex];
  const nextRestaurant = restaurants[currentIndex + 1];
  const hasMore = currentIndex < restaurants.length;
  const progressPercentage = ((currentIndex + 1) / restaurants.length) * 100;

  // Preload next few images to prevent disappearing
  useEffect(() => {
    const preloadImages = () => {
      for (let i = currentIndex; i < Math.min(currentIndex + 3, restaurants.length); i++) {
        const img = new Image();
        img.src = restaurants[i].image;
      }
    };
    
    if (restaurants.length > 0) {
      preloadImages();
    }
  }, [currentIndex, restaurants]);

  // Update swipe direction based on x position - debounced to avoid render conflicts
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const unsubscribe = x.on("change", (latest) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (Math.abs(latest) > 50) {
          setSwipeDirection(latest > 0 ? 'right' : 'left');
        } else {
          setSwipeDirection(null);
        }
      }, 0);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [x]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (isAnimating) return;
    
    const swipeThreshold = 100;
    const { offset, velocity } = info;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500) {
      const direction = offset.x > 0 ? 'right' : 'left';
      
      setIsAnimating(true);
      setSwipeDirection(direction);
      
      if (direction === 'right') {
        onMatch(currentRestaurant);
      } else {
        onSkip(currentRestaurant);
      }
      
      // Advance to next card
      setTimeout(() => {
        onIndexChange(currentIndex + 1);
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 150);
    } else {
      // Snap back to center
      x.set(0);
      setSwipeDirection(null);
    }
  };

  const handleSkipClick = () => {
    if (!hasMore || isAnimating) return;
    
    setIsAnimating(true);
    onSkip(currentRestaurant);
    
    setTimeout(() => {
      onIndexChange(currentIndex + 1);
      x.set(0);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 150);
  };

  const handleMatchClick = () => {
    if (!hasMore || isAnimating) return;
    
    setIsAnimating(true);
    onMatch(currentRestaurant);
    
    setTimeout(() => {
      onIndexChange(currentIndex + 1);
      x.set(0);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 150);
  };

  const handleRestartClick = () => {
    onIndexChange(0);
    x.set(0);
    setSwipeDirection(null);
    setIsAnimating(false);
  };



  if (!hasMore) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-3 items-center p-6">
          <div className="flex justify-start">
            <button onClick={onFiltersClick}>
              <Sliders className="w-6 h-6 text-foreground" />
            </button>
          </div>
          <div className="flex justify-center">
            <h1 className="text-xl font-semibold text-primary">Muncher</h1>
          </div>
          <div className="flex items-center justify-end space-x-4">
            <button onClick={onFavoritesClick} className="relative">
              <Heart className={`w-6 h-6 text-foreground ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {favoritesCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </div>
              )}
            </button>
            <button 
              onClick={onProfileClick}
              className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <User className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>



        {/* No More Cards */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              You've seen everything!
            </h2>
            <p className="text-lg text-muted-foreground">
              We didn't find any more matches nearby. Try adjusting your filters or check back later.
            </p>
          </div>
          
          <div className="space-y-4 w-full max-w-sm">
            <Button 
              onClick={onFiltersClick}
              className="w-full h-14 rounded-3xl text-lg bg-primary hover:bg-primary/90 text-white"
            >
              Edit Filters
            </Button>
            
            <Button 
              onClick={handleRestartClick}
              variant="outline"
              className="w-full h-14 rounded-3xl text-lg"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="grid grid-cols-3 items-center p-6">
        <div className="flex justify-start">
          <button onClick={onFiltersClick}>
            <Sliders className="w-6 h-6 text-foreground" />
          </button>
        </div>
        <div className="flex justify-center">
          <h1 className="text-xl font-semibold text-primary">Muncher</h1>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <button onClick={onFavoritesClick} className="relative">
            <Heart className={`w-6 h-6 text-foreground ${favoritesCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {favoritesCount > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </div>
            )}
          </button>
          <button 
            onClick={onProfileClick}
            className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <User className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Minimal Progress Indicator */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-center mb-4">
          {/* Subtle dot indicators */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(restaurants.length, 5) }, (_, i) => {
              const dotIndex = Math.floor((currentIndex / restaurants.length) * 5);
              return (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i <= dotIndex ? 'bg-primary/70' : 'bg-muted-foreground/25'
                  }`}
                />
              );
            })}
          </div>
        </div>
        
        {/* Enhanced Progress Bar with Subtle Animation */}
        <div className="relative h-1 bg-muted/40 rounded-full overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 to-primary/60 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut",
              type: "spring",
              stiffness: 80,
              damping: 20
            }}
          />
          
          {/* Subtle flowing animation */}
          <motion.div 
            className="absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
            initial={{ x: -32 }}
            animate={{ 
              x: progressPercentage > 10 ? `${(progressPercentage / 100) * 100 - 8}%` : -32
            }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.2
            }}
          />
        </div>
      </div>



      {/* Card Deck Area */}
      <div className="flex-1 relative px-6 pb-24">
        <div className="relative w-full h-full">
          {/* Single Background Card - Only Next Card */}
          {nextRestaurant && (
            <div
              key={`background-${nextRestaurant.id}`}
              className="absolute inset-0"
              style={{
                transform: `scale(0.94) translateY(6px)`,
                opacity: 0.5,
                zIndex: 10,
              }}
            >
              <RestaurantCard
                restaurant={nextRestaurant}
                swipeDirection={null}
                swipeOpacity={0}
                className="pointer-events-none"
              />
            </div>
          )}

          {/* Main Interactive Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`main-${currentRestaurant.id}-${currentIndex}`}
              className="absolute inset-0"
              style={{
                x,
                rotate,
                opacity,
                zIndex: 20
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              initial={{ scale: 1, opacity: 1, x: 0 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ 
                scale: 0.8, 
                opacity: 0,
                transition: { duration: 0.15 }
              }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <RestaurantCard
                restaurant={currentRestaurant}
                swipeDirection={swipeDirection}
                swipeOpacity={swipeDirection ? 1 : 0}
                onInfoClick={() => onViewDetails(currentRestaurant)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center space-x-12 px-6">
        <motion.button
          onClick={handleSkipClick}
          disabled={isAnimating}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg transition-colors"
          whileHover={{ scale: isAnimating ? 1 : 1.1 }}
          whileTap={{ scale: isAnimating ? 1 : 0.95 }}
        >
          <X className="w-8 h-8 text-white" />
        </motion.button>
        
        <motion.button
          onClick={handleMatchClick}
          disabled={isAnimating}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg transition-colors"
          whileHover={{ scale: isAnimating ? 1 : 1.1 }}
          whileTap={{ scale: isAnimating ? 1 : 0.95 }}
        >
          <Heart className="w-8 h-8 text-white" />
        </motion.button>
      </div>
    </div>
  );
}