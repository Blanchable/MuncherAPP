import { Star, MapPin, Info } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { SwipeOverlay } from "./SwipeOverlay";
import { Restaurant } from "../data/mockRestaurants";

interface RestaurantCardProps {
  restaurant: Restaurant;
  swipeDirection: 'left' | 'right' | null;
  swipeOpacity: number;
  onInfoClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function RestaurantCard({ 
  restaurant, 
  swipeDirection, 
  swipeOpacity, 
  onInfoClick,
  style,
  className = ""
}: RestaurantCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-500 fill-yellow-500' 
            : i < rating 
            ? 'text-yellow-500 fill-yellow-500/50' 
            : 'text-gray-300'
        }`} 
      />
    ));
  };

  return (
    <div 
      className={`relative w-full h-full bg-background rounded-3xl shadow-xl overflow-hidden touch-none select-none ${className}`}
      style={style}
    >
      {/* Restaurant Image */}
      <div className="relative h-64 overflow-hidden touch-none">
        <ImageWithFallback
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover touch-none select-none"
        />
        
        {/* Price Range Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
          <span className="text-white font-semibold">{restaurant.priceRange}</span>
        </div>

        {/* Info Button - More prominent */}
        {onInfoClick && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              onInfoClick();
            }}
            onPointerDown={(e) => {
              e.stopPropagation(); // Prevent drag from starting on info button
            }}
            className="absolute top-4 left-4 w-12 h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 backdrop-blur-sm border border-white/20 z-10"
          >
            <Info className="w-6 h-6 text-primary" />
          </button>
        )}
      </div>

      {/* Restaurant Details */}
      <div className="p-6 space-y-4">
        {/* Restaurant Name & Cuisine */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            {restaurant.name}
          </h2>
          <p className="text-lg text-muted-foreground">
            {restaurant.cuisine}
          </p>
        </div>

        {/* Rating & Distance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(restaurant.rating)}
            </div>
            <span className="text-base font-semibold text-foreground">
              {restaurant.rating}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-base">
              {restaurant.distance} mi
            </span>
          </div>
        </div>

        {/* Enhanced Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {restaurant.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted/60 border border-border/50 rounded-full text-sm text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {restaurant.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {restaurant.description}
          </p>
        )}
      </div>

      {/* Swipe Overlay */}
      <SwipeOverlay direction={swipeDirection} opacity={swipeOpacity} />
    </div>
  );
}