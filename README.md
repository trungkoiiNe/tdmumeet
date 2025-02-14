# TDMU Meet - Team Management App

A React Native mobile application for managing teams and meetings at Thu Dau Mot University (TDMU). The app allows users to create, join, and manage teams with features like team invitations and real-time updates using Firebase.

## Features

- 🔐 Google Authentication
- 👥 Team Management
  - Create teams with custom settings
  - Join teams via invite codes
  - Update team information
  - Delete teams (team creators only)
- 🔄 Real-time Updates
- 📱 Cross-platform (iOS & Android)
- 🎨 Modern UI with smooth animations

## Technologies Used

- [React Native](https://reactnative.dev/) - Mobile app framework
- [Expo Router](https://docs.expo.dev/router/introduction/) - Navigation and routing
- [Firebase](https://firebase.google.com/)
  - Authentication
  - Cloud Firestore
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [@baronha/ting](https://github.com/baronha/ting) - Toast notifications
- [Google Sign-In](https://github.com/react-native-google-signin/google-signin)

## Prerequisites

- Node.js (v18 or newer)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project with Authentication and Firestore enabled

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tdmumeet
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
- Create a new Firebase project
- Enable Google Authentication
- Enable Cloud Firestore
- Download `google-services.json` and place it in the `android/app` directory
- Update the web client ID in `stores/authStore.tsx`

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Project Structure

```
├── app/                    # Main application screens
│   ├── (admin)/           # Admin-specific screens
│   ├── (user)/            # User-specific screens
│   ├── _layout.tsx        # Root layout configuration
│   ├── index.tsx          # Entry point
│   └── login.tsx          # Authentication screen
├── assets/                # Static assets (images, fonts)
├── stores/                # State management
│   ├── authStore.tsx      # Authentication state
│   └── stores.tsx         # Team management state
└── routers/               # Navigation configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)