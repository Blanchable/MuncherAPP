# Muncher - Swipe-Based Restaurant Discovery App

A modern mobile app for discovering local restaurants through an intuitive swipe interface, built with React and powered by Google Places API and Supabase.

## 🌟 Features

### Core Functionality
- **Swipe Interface**: Tinder-like swipe interface for browsing restaurants
- **Real-time Location**: GPS location detection with fallback to zip code entry
- **Smart Filtering**: Filter by cuisine, distance, price range, and dietary restrictions
- **Favorites Management**: Save and manage favorite restaurants
- **User Authentication**: Secure user accounts with Supabase
- **Restaurant Details**: Comprehensive restaurant information with photos, hours, and contact details

### Data Sources
- **Google Places API**: Real restaurant data with photos, ratings, and reviews
- **Mock Data Fallback**: Sample restaurant data when API is unavailable
- **Smart Caching**: Efficient data caching to minimize API calls

### Security & Privacy
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: Protection against API abuse
- **Data Encryption**: Sensitive user data encryption in storage
- **Privacy Controls**: User-controlled data sharing preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ or a modern web browser
- Google Cloud Platform account (for Places API)
- Supabase account (authentication already configured)

### Installation

1. **Clone or download the project**
2. **Navigate to the Muncher App directory**
3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Google Places API key (see setup instructions below)

4. **Open the app**:
   - If using a development server: Start your dev server and navigate to the app
   - If opening directly: Open `App.tsx` in your browser

### Google Places API Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable the following APIs**:
   - Places API
   - Geocoding API
   - Maps JavaScript API (optional, for enhanced features)
4. **Create credentials**:
   - Go to "Credentials" in the left menu
   - Click "Create Credentials" > "API Key"
   - Copy the API key to your `.env` file
5. **Configure API restrictions** (recommended):
   - Restrict the API key to your domain/localhost
   - Limit to only the APIs you need

### Environment Configuration

Edit your `.env` file with the following variables:

```env
# Required: Your Google Places API Key
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here

# Optional: App configuration
VITE_APP_ENV=development
VITE_MAX_REQUESTS_PER_MINUTE=60
```

## 📱 How to Use

### Getting Started
1. **Launch the app** and tap "Let's Eat"
2. **Allow location access** or enter your zip code
3. **Set your preferences** (optional) - cuisine types, distance, price range
4. **Start swiping**!

### Swiping
- **Swipe Right (❤️)**: Save restaurant to favorites
- **Swipe Left (✗)**: Skip restaurant
- **Tap Info Button**: View detailed restaurant information
- **Use Filter Button**: Adjust your search preferences
- **Use Heart Button**: View your saved favorites

### Account Features
- **Sign Up/Login**: Create an account to save preferences and favorites across devices
- **Profile Management**: Update your account information
- **Sync Across Devices**: Your favorites and preferences sync automatically

## 🏗️ Architecture

### Frontend
- **React** with TypeScript for type safety
- **Framer Motion** for smooth animations and gestures
- **Tailwind CSS** for responsive, mobile-first design
- **Lucide Icons** for consistent iconography

### Backend Services
- **Supabase**: User authentication and data storage
- **Google Places API**: Restaurant data and location services
- **Client-side caching**: Optimized performance with intelligent caching

### Security Measures
- **Input validation and sanitization**
- **Rate limiting and abuse prevention**
- **Encrypted storage of sensitive data**
- **CORS protection**
- **Session management**

## 🔧 API Integration

### Google Places API
The app integrates with several Google APIs:

```typescript
// Search for restaurants near a location
const restaurants = await googlePlacesService.searchRestaurants({
  location: { latitude: 40.7128, longitude: -74.0060 },
  radius: 5000, // 5km
  cuisine: ['italian', 'mexican'],
  minRating: 4.0
});

// Get detailed restaurant information
const details = await googlePlacesService.getRestaurantDetails(placeId);
```

### Supabase Integration
User data is securely stored in Supabase:

```typescript
// Save user preferences
await userPreferencesService.saveUserPreferences({
  userId: user.id,
  location: userLocation,
  filters: userFilters,
  privacy: { shareLocation: false }
});

// Manage favorites
await userPreferencesService.saveFavorites(userId, favorites);
```

## 🛡️ Security Features

### Data Protection
- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: API requests are limited to prevent abuse
- **Encryption**: Sensitive data like location coordinates are encrypted
- **Privacy Controls**: Users control what data is shared

### API Security
- **API Key Protection**: Google API keys should be restricted by domain
- **Request Validation**: All API requests include security headers
- **Error Handling**: Graceful handling of API failures with fallbacks

### User Privacy
- **Minimal Data Collection**: Only necessary data is stored
- **Data Encryption**: Location and personal data are encrypted
- **User Control**: Users can delete their data at any time
- **Anonymous Analytics**: Only aggregated, non-personal data for analytics

## 📊 Performance

### Optimization Features
- **Smart Caching**: Restaurant data cached for 15 minutes
- **Image Optimization**: Restaurant photos optimized for mobile
- **Lazy Loading**: Images loaded as needed
- **Efficient Queries**: Minimal API calls with intelligent batching

### Fallback Strategies
- **Mock Data**: Sample restaurants when API is unavailable
- **Graceful Degradation**: App works without internet for cached data
- **Error Recovery**: Automatic retry mechanisms for failed requests

## 🚀 Deployment

### Environment Setup
1. Set up production environment variables
2. Configure Google Places API restrictions for your domain
3. Set up Supabase production database
4. Configure CORS settings

### Security Checklist
- [ ] API keys restricted to production domains
- [ ] HTTPS enabled for all requests
- [ ] Rate limiting configured
- [ ] Error tracking set up
- [ ] User data backup configured

## 🤝 Contributing

### Development Setup
1. Follow the installation instructions above
2. Set up development environment variables
3. Create a feature branch for your changes
4. Test thoroughly before submitting

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Responsive, mobile-first design
- Comprehensive error handling
- Security-first approach

## 📄 License

This project is provided as-is for demonstration purposes. Please ensure you comply with Google Places API terms of service and any applicable data protection regulations.

## 🆘 Support

### Common Issues

**"No restaurants found"**
- Check your Google Places API key is valid and active
- Ensure the Places API is enabled in Google Cloud Console
- Verify your location permissions are granted

**"Location access failed"**
- Grant location permissions in your browser
- Try using zip code entry instead
- Check your internet connection

**"API rate limit exceeded"**
- Wait a few minutes for the rate limit to reset
- Consider upgrading your Google Cloud billing account for higher limits

### Getting Help
- Check the browser console for error messages
- Verify your environment variables are set correctly
- Ensure all required Google APIs are enabled

## 🔮 Roadmap

Future enhancements planned:
- [ ] Push notifications for new restaurants
- [ ] Social features (share favorites with friends)
- [ ] Restaurant reservations integration
- [ ] Dietary restriction filtering
- [ ] AI-powered recommendations
- [ ] Offline mode improvements
- [ ] Advanced analytics dashboard