// Environment configuration for API keys and settings
// In production, these should be set as environment variables

export const config = {
  // Google Places API
  googlePlaces: {
    apiKey: process.env.REACT_APP_GOOGLE_PLACES_API_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '',
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
  },
  
  // Supabase (already configured in separate files)
  supabase: {
    url: `https://lmezvyhfxdpxwizbqias.supabase.co`,
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZXp2eWhmeGRweHdpemJxaWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM2MTgsImV4cCI6MjA2ODY2OTYxOH0.6Jhs_ydbBIjNcSCgHXUmTZBSMFeeLOJddJaUHdAhjUc'
  },
  
  // Security settings
  security: {
    maxRequestsPerMinute: 60,
    enableCORS: true,
    allowedOrigins: ['http://localhost:3000', 'https://muncher-app.vercel.app'],
  },
  
  // App settings
  app: {
    defaultSearchRadius: 5000, // 5km in meters
    maxRestaurantsPerSearch: 20,
    minRating: 3.0,
  }
};

// Validation function to check if required environment variables are set
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    { key: 'GOOGLE_PLACES_API_KEY', value: config.googlePlaces.apiKey }
  ];
  
  const missingVars = requiredVars
    .filter(({ value }) => !value || value.trim() === '')
    .map(({ key }) => key);
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}