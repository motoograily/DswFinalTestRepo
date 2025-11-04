import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';

// Import mock Firebase instead of real Firebase
import { auth } from '../mockFirebase';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HotelDetailsScreen from '../screens/HotelDetailsScreen';
import BookingScreen from '../screens/BookingScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SignIn" component={SignInScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
  </Stack.Navigator>
);

// Explore Stack
const ExploreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExploreMain" component={ExploreScreen} />
    <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
  </Stack.Navigator>
);

// Main Tabs
const AppTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1C1C1E',
        borderTopColor: '#2C2C2E',
        paddingBottom: 8,
        paddingTop: 8,
        height: 60,
      },
      tabBarActiveTintColor: '#34C759',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarLabelStyle: {
        fontSize: 12,
        fontFamily: 'Helvetica',
        fontWeight: '500',
      },
    }}
  >
    <Tab.Screen 
      name="HomeTab" 
      component={HomeStack}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: 20 }}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="ExploreTab" 
      component={ExploreStack}
      options={{
        tabBarLabel: 'Explore',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: 20 }}>🔍</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="ProfileTab" 
      component={ProfileStack}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: 20 }}>👤</Text>
        ),
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Starting mock app initialization...');
    
    // Simple initialization - no AsyncStorage, no persistence
    const initializeApp = () => {
      try {
        // Always show onboarding for first run in mock version
        setIsOnboardingCompleted(false);
        
        // Set up mock auth state listener
        const unsubscribe = auth.onAuthStateChanged((user) => {
          console.log('🔐 Mock auth state:', user ? user.email : 'No user');
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('💥 Mock init error:', error);
        setLoading(false);
      }
    };

    const unsubscribe = initializeApp();
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#000000', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Text style={{ 
          color: '#FFFFFF', 
          fontFamily: 'Helvetica', 
          fontSize: 24,
          marginBottom: 20 
        }}>
          Hotel Booking
        </Text>
        <ActivityIndicator size="large" color="#34C759" />
        <Text style={{ 
          color: '#8E8E93', 
          fontFamily: 'Helvetica', 
          fontSize: 16,
          marginTop: 16 
        }}>
          Loading Mock App...
        </Text>
      </View>
    );
  }

  console.log('🎯 Navigation - Onboarding:', isOnboardingCompleted, 'User:', user ? 'YES' : 'NO');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <Stack.Screen name="App" component={AppTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;