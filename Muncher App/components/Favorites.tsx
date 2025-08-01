import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Trash2, Star, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Restaurant } from "../data/mockRestaurants";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface FavoritesProps {
  favorites: Restaurant[];
  onBack: () => void;
  onViewRestaurant: (restaurant: Restaurant) => void;
  onRemoveFavorite: (restaurant: Restaurant) => void;
  onStartSwiping: () => void;
}

export function Favorites({ favorites, onBack, onViewRestaurant, onRemoveFavorite, onStartSwiping }: FavoritesProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-3 h-3 fill-amber-400/50 text-amber-400" />
        )}
        <span className="text-sm font-medium">{rating}</span>
      </div>
    );
  };

  const getTimeAgo = () => {
    // Mock "saved X days ago" - in real app this would be calculated from save timestamp
    const days = Math.floor(Math.random() * 7) + 1;
    return days === 1 ? "Saved 1 day ago" : `Saved ${days} days ago`;
  };

  const handleRemove = (restaurant: Restaurant, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the view action
    onRemoveFavorite(restaurant);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-[#fafafa] border-b border-border/20">
        <div className="grid grid-cols-3 items-center p-6">
          <div className="flex justify-start">
            <motion.button
              onClick={onBack}
              className="w-10 h-10 bg-muted rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-2xl text-foreground">Favorites</h1>
          </div>
          
          <div className="flex justify-end">
            {favorites.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(!isEditMode)}
                className="text-primary hover:text-primary/80"
              >
                {isEditMode ? 'Done' : 'Edit'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center space-y-8">
            <div className="w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-background rounded-full border-2 border-border flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <Heart className="w-6 h-6 text-muted-foreground absolute -top-1 -right-1" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl text-foreground">No favorites yet</h2>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                Swipe right on a restaurant to save it here for later.
              </p>
            </div>
            
            <Button 
              onClick={onStartSwiping}
              className="h-14 px-8 rounded-3xl bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              Start Swiping
            </Button>
          </div>
        ) : (
          /* Favorites List */
          <div className="p-6 space-y-4 pb-8">
            {favorites.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div
                  className="bg-background rounded-2xl shadow-sm border border-border/50 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => !isEditMode && onViewRestaurant(restaurant)}
                >
                  <div className="flex p-4 space-x-4">
                    {/* Restaurant Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Restaurant Info */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="text-lg font-medium text-foreground line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {restaurant.cuisine} • {restaurant.tags.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {renderStars(restaurant.rating)}
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-sm">{restaurant.distance} mi</span>
                        </div>
                        <span className="text-sm font-medium">{restaurant.priceRange}</span>
                      </div>
                      
                      {restaurant.tagline && (
                        <p className="text-sm text-primary italic line-clamp-1">
                          {restaurant.tagline}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo()}
                      </p>
                    </div>
                    
                    {/* Remove Button in Edit Mode */}
                    {isEditMode && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={(e) => handleRemove(restaurant, e)}
                        className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center self-start"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive-foreground" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}