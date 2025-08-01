# Muncher - Swipe-Based Restaurant Discovery App

A modern, secure mobile app for discovering restaurants through an intuitive swipe interface. Built with React Native, Expo, and integrated with Google Places API and Supabase for authentication.

## Features

### 🍽️ Core Features
- **Swipe Interface**: Intuitive Tinder-like swipe interface for restaurant discovery
- **Real-time Location**: GPS-based restaurant search with fallback to zip code entry
- **Smart Filtering**: Filter by cuisine, price range, distance, and dietary preferences
- **Favorites System**: Save and manage your favorite restaurants
- **Detailed Views**: Comprehensive restaurant information with photos, ratings, and hours

### 🔒 Security Features
- **Data Encryption**: Secure storage of user preferences and favorites
- **Location Anonymization**: Privacy-focused location handling
- **Input Sanitization**: Protection against injection attacks
- **Rate Limiting**: API call protection and abuse prevention
- **Device Security**: Jailbreak/root detection and security validation
- **Secure Authentication**: Supabase-powered user authentication

### 🎨 Design Features
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Optimized for mobile devices
- **Accessibility**: Screen reader support and keyboard navigation
- **Dark Mode Support**: Automatic theme switching
- **Smooth Animations**: Framer Motion-powered interactions

## Tech Stack

- **Frontend**: React Native with Expo
- **UI Components**: shadcn/ui with Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Supabase
- **Location Services**: Expo Location
- **Restaurant Data**: Google Places API
- **State Management**: React Hooks
- **Security**: Custom encryption and validation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd muncher-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

## API Configuration

### Google Places API Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Places API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Places API" and enable it

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

4. **Restrict API Key** (Recommended)
   - Click on the created API key
   - Under "Application restrictions", select "iOS apps" and/or "Android apps"
   - Add your app's bundle identifier
   - Under "API restrictions", select "Places API"

### Supabase Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com/)
   - Create a new project

2. **Configure Authentication**
   - Go to "Authentication" > "Settings"
   - Configure your authentication providers
   - Set up email templates if needed

3. **Get API Keys**
   - Go to "Settings" > "API"
   - Copy the Project URL and anon/public key

## Running the App

### Development Mode
```bash
npm start
```

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web Browser
```bash
npm run web
```

## Security Features

### Data Protection
- **Encrypted Storage**: All sensitive data is encrypted before storage
- **Secure Transmission**: HTTPS for all API communications
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: Protection against API abuse

### Privacy Features
- **Location Anonymization**: Coordinates are rounded to protect privacy
- **Minimal Data Collection**: Only essential data is stored
- **Secure Logout**: Complete data cleanup on logout
- **Device Security**: Detection of compromised devices

### Authentication Security
- **Supabase Auth**: Industry-standard authentication
- **Session Management**: Secure session handling
- **Password Requirements**: Strong password enforcement
- **Account Recovery**: Secure password reset process

## Project Structure

```
Muncher App/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── figma/          # Design system components
│   └── *.tsx           # Feature components
├── data/               # Data models and mock data
├── utils/              # Utility services
│   ├── supabase/       # Authentication service
│   ├── googlePlaces.ts # Google Places API service
│   ├── locationService.ts # Location handling
│   └── securityService.ts # Security utilities
├── styles/             # Global styles and themes
├── supabase/           # Supabase functions
└── App.tsx            # Main application component
```

## Key Components

### SwipeDeck
The core swipe interface component that handles:
- Touch gestures and animations
- Restaurant card display
- Swipe logic and feedback
- Progress tracking

### RestaurantCard
Displays restaurant information with:
- High-quality images
- Rating and price information
- Distance and cuisine type
- Interactive elements

### Authentication Flow
Complete user authentication with:
- Login/Signup forms
- Password reset
- Profile management
- Secure session handling

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key | Yes |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure your Google Places API key is valid and has proper restrictions
   - Check that the Places API is enabled in your Google Cloud project

2. **Location Permissions**
   - Ensure location permissions are granted on the device
   - Check that location services are enabled

3. **Build Issues**
   - Clear Expo cache: `expo start -c`
   - Reset Metro bundler: `npm start -- --reset-cache`

4. **Authentication Issues**
   - Verify Supabase configuration
   - Check network connectivity
   - Ensure proper environment variables

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('Debug mode enabled');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the documentation

## Roadmap

### Planned Features
- [ ] Push notifications for new restaurants
- [ ] Social features (sharing, recommendations)
- [ ] Advanced filtering options
- [ ] Offline mode support
- [ ] Multi-language support
- [ ] Restaurant reviews and ratings
- [ ] Integration with food delivery services

### Security Enhancements
- [ ] Biometric authentication
- [ ] Advanced encryption
- [ ] Security audit logging
- [ ] Penetration testing
- [ ] Compliance certifications

---

**Note**: This app is designed with security and privacy in mind. All user data is handled according to best practices and relevant privacy regulations.