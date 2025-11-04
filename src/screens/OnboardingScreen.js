import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { globalStyles, colors, typography, spacing } from '../styles/global';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const onboardingData = [
    {
      id: 1,
      title: 'Discover Amazing Hotels',
      description: 'Find and book the perfect hotel for your next adventure',
      image: '🏨',
    },
    {
      id: 2,
      title: 'Easy Booking Process',
      description: 'Book your stay in just a few simple steps',
      image: '📱',
    },
    {
      id: 3,
      title: 'Real Guest Reviews',
      description: 'Make informed decisions with authentic reviews',
      image: '⭐',
    },
  ];

  const handleGetStarted = async () => {
    try {
      // Store as string 'true' instead of boolean
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      navigation.replace('Auth');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.replace('Auth');
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={{ flex: 1 }}>
        {onboardingData.map((item, index) => (
          <View 
            key={item.id} 
            style={{ 
              width, 
              height, 
              justifyContent: 'center', 
              alignItems: 'center',
              paddingHorizontal: spacing.md 
            }}
          >
            <Text style={{ fontSize: 80, marginBottom: spacing.lg }}>{item.image}</Text>
            <Text style={[typography.h1, { textAlign: 'center', marginBottom: spacing.md }]}>
              {item.title}
            </Text>
            <Text style={[typography.body, { textAlign: 'center', color: colors.textSecondary }]}>
              {item.description}
            </Text>
            
            {index === onboardingData.length - 1 && (
              <TouchableOpacity
                style={[globalStyles.button, { position: 'absolute', bottom: spacing.xl * 2 }]}
                onPress={handleGetStarted}
              >
                <Text style={globalStyles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default OnboardingScreen;