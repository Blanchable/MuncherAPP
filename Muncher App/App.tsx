import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Utensils } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { LocationPermission } from "./components/LocationPermission";
import { ZipCodeEntry } from "./components/ZipCodeEntry";
import { FilterSetupPrompt } from "./components/FilterSetupPrompt";
import { FilterSetup } from "./components/FilterSetup";
import { ReadyToSwipe } from "./components/ReadyToSwipe";
import { SwipeDeck } from "./components/SwipeDeck";
import { MatchDetailView } from "./components/MatchDetailView";
import { Favorites } from "./components/Favorites";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Profile } from "./components/Profile";
import { ForgotPassword } from "./components/ForgotPassword";
import { ForgotPasswordConfirmation } from "./components/ForgotPasswordConfirmation";
import { Restaurant } from "./data/mockRestaurants";
import { authService, User } from "./utils/supabase/client";
import { googlePlacesService, Location, PlacesSearchParams } from "./utils/googlePlaces";
import { locationService, LocationResult } from "./utils/locationService";
import { securityService } from "./utils/securityService";

type Screen = 'intro' | 'login' | 'signup' | 'profile' | 'forgot-password' | 'forgot-password-confirmation' | 'location' | 'zip-code' | 'filter-prompt' | 'filter-setup' | 'ready-to-swipe' | 'swipe-deck' | 'match-detail' | 'favorites';

interface FilterState {
  distance: number;
  cuisines: string[];
  dietaryRestrictions: string[];
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userFilters, setUserFilters] = useState<FilterState | null>(null);
  const [userLocation, setUserLocation] = useState<{ type: 'gps' | 'zipcode'; value: string; coordinates?: Location } | null>(null);
  const [matches, setMatches] = useState<Restaurant[]>([]);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [skipped, setSkipped] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');

  // Initialize auth state and load secure data
  useEffect(() => {
    let mounted = true;
    let wasAuthenticated = false;

    const initAuth = async () => {
      try {
        // Check for existing session
        const session = await authService.getSession();
        if (mounted && session?.user) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          wasAuthenticated = true;
          
          // Load favorites from secure storage
          try {
            const storedFavorites = await securityService.secureRetrieve('favorites');
            if (storedFavorites && Array.isArray(storedFavorites)) {
              setFavorites(storedFavorites);
            }
          } catch (error) {
            console.error('Error loading favorites:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsAuthLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        const previousUser = user;
        setUser(user);
        
        // Only redirect to intro if user was previously authenticated and is now logged out
        if (wasAuthenticated && !user && currentScreen !== 'intro' && currentScreen !== 'login' && currentScreen !== 'signup' && currentScreen !== 'forgot-password' && currentScreen !== 'forgot-password-confirmation') {
          // User logged out, return to intro
          setCurrentScreen('intro');
          wasAuthenticated = false;
        } else if (user) {
          wasAuthenticated = true;
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleGetStarted = () => {
    setCurrentScreen('location');
  };

  const handleLocationAllow = async () => {
    try {
      console.log("Requesting location permission...");
      
      // Check if device is secure
      const isSecure = await securityService.isDeviceSecure();
      if (!isSecure) {
        console.warn('Device security check failed');
      }

      // Get current location
      const locationResult: LocationResult = await locationService.getCurrentLocation();
      
      if (locationResult.success && locationResult.location) {
        // Anonymize location for security
        const anonymizedLocation = securityService.anonymizeLocation(
          locationResult.location.latitude,
          locationResult.location.longitude
        );
        
        setUserLocation({ 
          type: 'gps', 
          value: 'current-location',
          coordinates: anonymizedLocation
        });
        
        // Log security event
        securityService.logSecurityEvent('location_permission_granted', {
          locationType: 'gps',
          anonymized: anonymizedLocation
        });
        
        setCurrentScreen('filter-prompt');
      } else {
        console.error('Location permission denied or failed:', locationResult.error);
        // Fallback to zip code entry
        setCurrentScreen('zip-code');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentScreen('zip-code');
    }
  };

  const handleLocationSkip = () => {
    console.log("Skipping location permission, going to zip code entry...");
    setCurrentScreen('zip-code');
  };

  const handleZipCodeContinue = async (zipCode: string) => {
    try {
      console.log("Using zip code:", zipCode);
      
      // Sanitize input
      const sanitizedZipCode = securityService.sanitizeInput(zipCode);
      
      // Geocode zip code
      const geocodeResult = await locationService.geocodeZipCode(sanitizedZipCode);
      
      if (geocodeResult.success && geocodeResult.location) {
        // Anonymize location for security
        const anonymizedLocation = securityService.anonymizeLocation(
          geocodeResult.location.latitude,
          geocodeResult.location.longitude
        );
        
        setUserLocation({ 
          type: 'zipcode', 
          value: sanitizedZipCode,
          coordinates: anonymizedLocation
        });
        
        // Log security event
        securityService.logSecurityEvent('location_zipcode_used', {
          locationType: 'zipcode',
          anonymized: anonymizedLocation
        });
        
        setCurrentScreen('filter-prompt');
      } else {
        console.error('Failed to geocode zip code:', geocodeResult.error);
        toast.error('Invalid zip code. Please try again.');
      }
    } catch (error) {
      console.error('Error processing zip code:', error);
      toast.error('Error processing zip code. Please try again.');
    }
  };

  const handleZipCodeBack = () => {
    console.log("Going back to location permission...");
    setCurrentScreen('location');
  };

  const handleSetPreferences = () => {
    console.log("Going to filter setup...");
    setCurrentScreen('filter-setup');
  };

  const handleSkipFilters = () => {
    console.log("Skipping filter setup...");
    setCurrentScreen('ready-to-swipe');
  };

  const handleApplyFilters = (filters: FilterState) => {
    console.log("Applied filters:", filters);
    setUserFilters(filters);
    setCurrentScreen('ready-to-swipe');
  };

  const handleSkipFilterSetup = () => {
    console.log("Skipping detailed filter setup...");
    setCurrentScreen('ready-to-swipe');
  };

  const handleStartSwiping = async () => {
    try {
      console.log("Starting swipe interface...");
      
      // Check rate limiting
      if (securityService.isRateLimited('restaurant_search', 5, 60000)) {
        toast.error('Too many requests. Please wait a moment.');
        return;
      }
      
      if (!userLocation?.coordinates) {
        console.error('No location available');
        toast.error('Location is required to find restaurants.');
        return;
      }
      
      // Build search parameters
      const searchParams: PlacesSearchParams = {
        location: userLocation.coordinates,
        radius: userFilters?.distance ? userFilters.distance * 1609.34 : 5000, // Convert miles to meters
        type: 'restaurant',
        openNow: true,
      };
      
      // Add cuisine filters if specified
      if (userFilters?.cuisines && userFilters.cuisines.length > 0) {
        searchParams.keyword = userFilters.cuisines.join(' ');
      }
      
      // Add price filters
      if (userFilters) {
        const priceMap = { '$': 0, '$$': 1, '$$$': 2, '$$$$': 3 };
        const prices = userFilters.cuisines?.map(c => priceMap[c as keyof typeof priceMap]).filter(Boolean) || [];
        if (prices.length > 0) {
          searchParams.minPrice = Math.min(...prices);
          searchParams.maxPrice = Math.max(...prices);
        }
      }
      
      // Search for restaurants
      const restaurants = await googlePlacesService.searchNearbyRestaurants(searchParams);
      
      if (restaurants.length > 0) {
        setMatches(restaurants);
        setCurrentSwipeIndex(0);
        
        // Log security event
        securityService.logSecurityEvent('restaurant_search_completed', {
          count: restaurants.length,
          location: securityService.anonymizeLocation(
            userLocation.coordinates.latitude,
            userLocation.coordinates.longitude
          )
        });
        
        setCurrentScreen('swipe-deck');
      } else {
        toast.error('No restaurants found nearby. Try adjusting your filters.');
      }
    } catch (error) {
      console.error('Error starting swipe interface:', error);
      toast.error('Error loading restaurants. Please try again.');
    }
  };

  const handleEditPreferences = () => {
    console.log("Going back to edit preferences...");
    setCurrentScreen('filter-setup');
  };

  const handleMatch = async (restaurant: Restaurant) => {
    console.log("Saved:", restaurant.name);
    
    // Validate restaurant data
    if (!securityService.validateApiResponse(restaurant)) {
      console.error('Invalid restaurant data');
      return;
    }
    
    // Add to favorites when swiping right
    setFavorites(prev => {
      const isAlreadyFavorite = prev.find(fav => fav.id === restaurant.id);
      if (!isAlreadyFavorite) {
        // Show toast feedback
        toast.success("Saved to Favorites", {
          description: restaurant.name,
          duration: 1500,
        });
        
        // Securely store favorites
        const newFavorites = [...prev, restaurant];
        securityService.secureStore('favorites', newFavorites).catch(console.error);
        
        // Log security event
        securityService.logSecurityEvent('restaurant_favorited', {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        });
        
        return newFavorites;
      }
      return prev;
    });
    // No longer navigate to detail view - keep browsing momentum
  };

  const handleSkip = (restaurant: Restaurant) => {
    console.log("Skipped:", restaurant.name);
    setSkipped(prev => [...prev, restaurant]);
  };

  const handleFiltersClick = () => {
    console.log("Opening filters...");
    setCurrentScreen('filter-setup');
  };

  const handleFavoritesClick = () => {
    console.log("Opening favorites...");
    setCurrentScreen('favorites');
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    if (user) {
      setCurrentScreen('profile');
    } else {
      setCurrentScreen('login');
    }
  };

  const handleBackToSwipe = () => {
    // Return to the appropriate screen without advancing deck
    if (previousScreen === 'favorites') {
      setCurrentScreen('favorites');
    } else {
      setCurrentScreen('swipe-deck');
    }
    setSelectedRestaurant(null);
    setPreviousScreen(null);
  };

  const handleBackToSwipeFromFavorites = () => {
    setCurrentScreen('swipe-deck');
  };

  const handleSaveToFavorites = (restaurant: Restaurant) => {
    console.log("Toggling favorite:", restaurant.name);
    setFavorites(prev => {
      const isAlreadyFavorite = prev.find(fav => fav.id === restaurant.id);
      if (isAlreadyFavorite) {
        // Remove from favorites
        return prev.filter(fav => fav.id !== restaurant.id);
      } else {
        // Add to favorites
        return [...prev, restaurant];
      }
    });
  };

  const handleRemoveFavorite = (restaurant: Restaurant) => {
    console.log("Removing from favorites:", restaurant.name);
    setFavorites(prev => prev.filter(fav => fav.id !== restaurant.id));
  };

  const handleViewRestaurantFromFavorites = (restaurant: Restaurant) => {
    console.log("Viewing restaurant from favorites:", restaurant.name);
    setSelectedRestaurant(restaurant);
    setPreviousScreen('favorites');
    setCurrentScreen('match-detail');
  };

  const handleViewRestaurantDetails = (restaurant: Restaurant) => {
    console.log("Viewing restaurant details:", restaurant.name);
    setSelectedRestaurant(restaurant);
    setPreviousScreen('swipe-deck');
    setCurrentScreen('match-detail');
  };

  // Auth handlers
  const handleAuthSuccess = () => {
    console.log("Authentication successful");
    setCurrentScreen('location');
  };

  const handleLogout = async () => {
    try {
      console.log("User logged out");
      
      // Log security event
      securityService.logSecurityEvent('user_logout', {
        userId: user?.id
      });
      
      // Clear all secure data
      await securityService.clearAllSecureData();
      
      // Sign out from Supabase
      await authService.signOut();
      
      setUser(null);
      setCurrentScreen('intro');
      // Reset app state
      setUserFilters(null);
      setUserLocation(null);
      setFavorites([]);
      setSkipped([]);
      setCurrentSwipeIndex(0);
      setResetPasswordEmail('');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still reset the app state even if logout fails
      setUser(null);
      setCurrentScreen('intro');
    }
  };

  const handleBackFromAuth = () => {
    setCurrentScreen('intro');
  };

  const handleGoToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const handleGoToForgotPassword = () => {
    setCurrentScreen('forgot-password');
  };

  const handleForgotPasswordSuccess = (email: string) => {
    setResetPasswordEmail(email);
    setCurrentScreen('forgot-password-confirmation');
  };

  const handleBackFromForgotPassword = () => {
    setCurrentScreen('login');
  };

  const handleBackFromForgotPasswordConfirmation = () => {
    setCurrentScreen('forgot-password');
  };

  const handleBackToLoginFromForgotPassword = () => {
    setCurrentScreen('login');
  };

  const handleBackFromProfile = () => {
    setCurrentScreen('swipe-deck');
  };

  // Show loading while checking auth state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[390px] h-[844px] bg-[#fafafa] flex items-center justify-center rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-pulse">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return (
          <div className="flex-1 flex flex-col justify-between px-8 py-8">
            {/* Header Section with Logo and App Name */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-10">
              <div className="flex flex-col items-center space-y-8">
                {/* Clean Logo */}
                <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-lg p-3">
                  <Utensils className="w-12 h-12 text-white" />
                </div>
                
                {/* App Name */}
                <h1 className="text-5xl font-semibold text-primary tracking-tight">
                  Muncher
                </h1>
              </div>
              
              {/* Value Statement */}
              <div className="text-center">
                <p className="text-3xl text-foreground tracking-wide">
                  Swipe. Match. Eat.
                </p>
              </div>
            </div>
            
            {/* Bottom Section with CTA Button */}
            <div className="w-full">
              <Button 
                onClick={handleGetStarted}
                className="w-full h-16 rounded-3xl text-xl shadow-lg bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                Let's Eat
              </Button>
            </div>
          </div>
        );

      case 'login':
        return (
          <Login
            onBack={handleBackFromAuth}
            onSuccess={handleAuthSuccess}
            onGoToSignup={handleGoToSignup}
            onForgotPassword={handleGoToForgotPassword}
          />
        );

      case 'signup':
        return (
          <Signup
            onBack={handleBackFromAuth}
            onSuccess={handleAuthSuccess}
            onGoToLogin={handleGoToLogin}
          />
        );

      case 'forgot-password':
        return (
          <ForgotPassword
            onBack={handleBackFromForgotPassword}
            onSuccess={handleForgotPasswordSuccess}
          />
        );

      case 'forgot-password-confirmation':
        return (
          <ForgotPasswordConfirmation
            email={resetPasswordEmail}
            onBack={handleBackFromForgotPasswordConfirmation}
            onBackToLogin={handleBackToLoginFromForgotPassword}
          />
        );

      case 'profile':
        return user ? (
          <Profile
            user={user}
            onBack={handleBackFromProfile}
            onLogout={handleLogout}
          />
        ) : null;
        
      case 'location':
        return (
          <LocationPermission 
            onAllow={handleLocationAllow}
            onSkip={handleLocationSkip}
          />
        );

      case 'zip-code':
        return (
          <ZipCodeEntry
            onBack={handleZipCodeBack}
            onContinue={handleZipCodeContinue}
          />
        );

      case 'filter-prompt':
        return (
          <FilterSetupPrompt 
            onSetPreferences={handleSetPreferences}
            onSkip={handleSkipFilters}
          />
        );

      case 'filter-setup':
        return (
          <FilterSetup 
            onApplyFilters={handleApplyFilters}
            onSkip={handleSkipFilterSetup}
          />
        );

      case 'ready-to-swipe':
        return (
          <ReadyToSwipe 
            onStartSwiping={handleStartSwiping}
            onEditPreferences={handleEditPreferences}
          />
        );
        
      case 'swipe-deck':
        return (
          <SwipeDeck 
            onMatch={handleMatch}
            onSkip={handleSkip}
            onFiltersClick={handleFiltersClick}
            onFavoritesClick={handleFavoritesClick}
            onViewDetails={handleViewRestaurantDetails}
            onProfileClick={handleProfileClick}
            userFilters={userFilters}
            currentIndex={currentSwipeIndex}
            onIndexChange={setCurrentSwipeIndex}
            favoritesCount={favorites.length}
            restaurants={matches}
          />
        );

      case 'match-detail':
        return selectedRestaurant ? (
          <MatchDetailView
            restaurant={selectedRestaurant}
            onBack={handleBackToSwipe}
            onSaveToFavorites={handleSaveToFavorites}
            isInFavorites={favorites.some(fav => fav.id === selectedRestaurant.id)}
          />
        ) : null;

      case 'favorites':
        return (
          <Favorites
            favorites={favorites}
            onBack={handleBackToSwipeFromFavorites}
            onViewRestaurant={handleViewRestaurantFromFavorites}
            onRemoveFavorite={handleRemoveFavorite}
            onStartSwiping={handleStartSwiping}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* iPhone 13/14 Container */}
      <div className="w-full max-w-[390px] h-[844px] bg-[#fafafa] flex flex-col relative rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* Safe area top */}
        <div className="h-12 flex-shrink-0"></div>
        
        {/* Content Area - Now allows overflow for scrolling */}
        <div className="flex-1 min-h-0 flex flex-col">
          {renderScreen()}
        </div>
        
        {/* Safe area bottom */}
        <div className="h-8 flex-shrink-0"></div>
        
        {/* Toast notifications - Inside app container */}
        <Toaster 
          position="bottom-center"
          toastOptions={{
            duration: 1500,
            style: {
              marginBottom: '9rem', // Moved higher to avoid blocking swipe buttons
            },
            className: 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2',
            descriptionClassName: 'text-muted-foreground',
          }}
        />
      </div>
    </div>
  );
}