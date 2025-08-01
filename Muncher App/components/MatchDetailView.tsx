import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Phone, Globe, Heart, Navigation, Star, ChevronDown, ChevronUp, ExternalLink, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Restaurant } from "../data/mockRestaurants";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface MatchDetailViewProps {
  restaurant: Restaurant;
  onBack: () => void;
  onSaveToFavorites: (restaurant: Restaurant) => void;
  isInFavorites?: boolean;
}

export function MatchDetailView({ restaurant, onBack, onSaveToFavorites, isInFavorites = true }: MatchDetailViewProps) {
  const [showFullHours, setShowFullHours] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(isInFavorites); // Use prop to determine initial state

  const handleGetDirections = () => {
    if (restaurant.address) {
      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleCall = () => {
    if (restaurant.phone) {
      window.open(`tel:${restaurant.phone}`, '_self');
    }
  };

  const handleWebsite = () => {
    if (restaurant.website) {
      window.open(`https://${restaurant.website}`, '_blank');
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSaveToFavorites(restaurant);
  };

  const getCurrentDayHours = () => {
    if (!restaurant.hours) return null;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return restaurant.hours[today];
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 fill-amber-400/50 text-amber-400" />
        )}
        <span className="ml-1 font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Hero Image with Header Overlay */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        {/* Header with Back Button - Overlay on Image */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-6">
          <motion.button
            onClick={onBack}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <motion.button
            onClick={handleSave}
            className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center ${
              isSaved ? 'bg-red-500/90' : 'bg-black/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart className={`w-5 h-5 text-white ${isSaved ? 'fill-white' : ''}`} />
          </motion.button>
        </div>

        {/* Hero Image */}
        <motion.div
          className="w-full h-full cursor-pointer"
          onClick={() => setIsImageExpanded(!isImageExpanded)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <ImageWithFallback
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>
        
        {/* Tap to expand hint */}
        <div className="absolute top-6 right-20">
          <Badge variant="secondary" className="bg-black/60 text-white border-none backdrop-blur-sm">
            Tap to expand
          </Badge>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 bg-background -mt-6 rounded-t-3xl relative z-10 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 pb-32">
            {/* Restaurant Overview */}
            <div className="space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl text-foreground">{restaurant.name}</h1>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <span>{restaurant.cuisine}</span>
                  {restaurant.tags.slice(0, 2).map((tag, index) => (
                    <span key={index}>· {tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {renderStars(restaurant.rating)}
                  <span className="text-lg">{restaurant.priceRange}</span>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.distance} mi</span>
                  </div>
                </div>
              </div>
              
              {restaurant.tagline && (
                <p className="text-primary italic">{restaurant.tagline}</p>
              )}
            </div>

            {/* Description */}
            {restaurant.description && (
              <div className="space-y-2">
                <h3>About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {restaurant.description}
                </p>
              </div>
            )}

            {/* Location & Directions */}
            {restaurant.address && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3>Location</h3>
                </div>
                
                {/* Enhanced Realistic Map Preview */}
                <div className="h-32 bg-gradient-to-br from-green-50 via-blue-50 to-gray-50 rounded-lg relative overflow-hidden border">
                  {/* Simulated street grid pattern */}
                  <div className="absolute inset-0">
                    {/* Horizontal roads */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute top-8 left-0 right-0 h-1 bg-gray-400"></div>
                    <div className="absolute top-16 left-0 right-0 h-0.5 bg-gray-300"></div>
                    <div className="absolute top-24 left-0 right-0 h-0.5 bg-gray-300"></div>
                    
                    {/* Vertical roads */}
                    <div className="absolute top-0 left-8 bottom-0 w-0.5 bg-gray-300"></div>
                    <div className="absolute top-0 left-16 bottom-0 w-1 bg-gray-400"></div>
                    <div className="absolute top-0 left-24 bottom-0 w-0.5 bg-gray-300"></div>
                    <div className="absolute top-0 right-8 bottom-0 w-0.5 bg-gray-300"></div>
                    
                    {/* Building blocks */}
                    <div className="absolute top-1 left-1 w-6 h-6 bg-gray-200 rounded-sm opacity-60"></div>
                    <div className="absolute top-9 left-9 w-4 h-6 bg-gray-200 rounded-sm opacity-60"></div>
                    <div className="absolute top-17 right-10 w-5 h-5 bg-gray-200 rounded-sm opacity-60"></div>
                    <div className="absolute bottom-2 left-20 w-6 h-4 bg-gray-200 rounded-sm opacity-60"></div>
                  </div>
                  
                  {/* Restaurant pin */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-primary"></div>
                    </div>
                  </div>
                  
                  {/* Map attribution */}
                  <div className="absolute bottom-1 right-1">
                    <span className="text-xs text-gray-400 bg-white/80 px-1 rounded">Map</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-muted-foreground">{restaurant.address}</p>
                </div>
              </div>
            )}

            {/* Hours & Status */}
            {restaurant.hours && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3>Hours</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${restaurant.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm ${restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {restaurant.isOpen ? `Open until ${restaurant.openUntil}` : 'Closed'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Today</span>
                    <span className="text-sm text-muted-foreground">
                      {getCurrentDayHours() || 'Hours not available'}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={() => setShowFullHours(!showFullHours)}
                    className="w-full justify-between h-auto p-2"
                  >
                    <span className="text-sm">View all hours</span>
                    {showFullHours ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                  
                  {showFullHours && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {Object.entries(restaurant.hours).map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between p-2 text-sm">
                          <span className="font-medium">{day}</span>
                          <span className="text-muted-foreground">{hours}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Popular Tags & Highlights */}
            {restaurant.highlights && restaurant.highlights.length > 0 && (
              <div className="space-y-3">
                <h3>What makes this place special</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.highlights.map((highlight, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-sm border-primary/20 text-primary"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Preview */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Menu className="w-5 h-5 text-primary" />
                <h3>Menu</h3>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => restaurant.website && window.open(`https://${restaurant.website}/menu`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Menu
              </Button>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Buttons */}
        <div className="flex-shrink-0 bg-background border-t border-border p-6">
          <div className="flex space-x-3">
            <Button 
              onClick={handleGetDirections}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Get Directions
            </Button>
            
            <motion.button
              onClick={handleSave}
              className={`h-12 w-12 rounded-lg flex items-center justify-center text-white ${
                isSaved 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
            </motion.button>
            
            {restaurant.phone && (
              <motion.button
                onClick={handleCall}
                className="h-12 w-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-5 h-5" />
              </motion.button>
            )}
            
            {restaurant.website && (
              <motion.button
                onClick={handleWebsite}
                className="h-12 w-12 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Image Modal - Constrained within phone boundaries */}
      {isImageExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setIsImageExpanded(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative w-full h-full max-w-full max-h-full p-4"
          >
            <ImageWithFallback
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}