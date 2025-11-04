import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Dimensions, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './src/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  setDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');


const HOTEL_IMAGES = {
  'The Silo Hotel': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'Singita Kruger National Park': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'One&Only Cape Town': 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'The Oyster Box': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1925&q=80',
  'The Saxon Hotel': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
};


const NavigationContext = React.createContext();

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [user, setUser] = useState(null);
  const [screenHistory, setScreenHistory] = useState(['onboarding']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuthState = async () => {
      try {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user);
            // Check onboarding status
            const onboarded = await AsyncStorage.getItem('@onboarding_completed');
            if (onboarded === 'true') {
              setCurrentScreen('home');
            }
          } else {
            setUser(null);
            const onboarded = await AsyncStorage.getItem('@onboarding_completed');
            setCurrentScreen(onboarded === 'true' ? 'auth' : 'onboarding');
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth state error:', error);
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const navigate = (screenName) => {
    setScreenHistory(prev => [...prev, screenName]);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      setScreenHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  };

  const replace = (screenName) => {
    setScreenHistory([screenName]);
    setCurrentScreen(screenName);
  };

  const canGoBack = screenHistory.length > 1;

  const navigation = {
    navigate,
    goBack,
    replace,
    canGoBack
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const screens = {
    onboarding: <OnboardingScreen navigation={navigation} />,
    auth: <AuthScreen navigation={navigation} setUser={setUser} />,
    home: <HomeScreen navigation={navigation} user={user} />,
    explore: <ExploreScreen navigation={navigation} user={user} />,
    profile: <ProfileScreen navigation={navigation} user={user} setUser={setUser} />,
    hotelDetails: <HotelDetailsScreen navigation={navigation} user={user} />,
    booking: <BookingScreen navigation={navigation} user={user} />,
    rating: <RatingScreen navigation={navigation} user={user} />,
  };

  return (
    <NavigationContext.Provider value={navigation}>
      <View style={styles.appContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        {screens[currentScreen]}
      </View>
    </NavigationContext.Provider>
  );
};



const ScreenHeader = ({ navigation, title, showBackButton = true }) => {
  return null;
};

const StarRating = ({ rating, onRatingChange, size = 24, editable = false }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => editable && onRatingChange(star)}
          disabled={!editable}
        >
          <Ionicons 
            name={star <= rating ? "star" : "star-outline"} 
            size={size} 
            color="#FFD700" 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const onboardingData = [
    {
      id: 1,
      title: 'Discover Luxury South African Hotels',
      description: 'Find and book the perfect hotel for your next adventure across beautiful South Africa',
      icon: '🏨',
    },
    {
      id: 2,
      title: 'Easy Booking Process',
      description: 'Book your stay in just a few simple steps with secure payment',
      icon: '📱',
    },
    {
      id: 3,
      title: 'Real Guest Reviews & Ratings',
      description: 'Make informed decisions with authentic reviews from fellow travelers',
      icon: '⭐',
    },
  ];

  const nextSlide = () => {
    if (currentSlide < onboardingData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      AsyncStorage.setItem('@onboarding_completed', 'true');
      navigation.replace('auth');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.onboardingContainer}>
        <View style={styles.onboardingContent}>
          <Text style={styles.emoji}>{onboardingData[currentSlide].icon}</Text>
          <Text style={styles.title}>{onboardingData[currentSlide].title}</Text>
          <Text style={styles.subtitle}>{onboardingData[currentSlide].description}</Text>
        </View>

        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.activeDot
              ]}
            />
          ))}
        </View>

        <View style={styles.onboardingButtons}>
          <TouchableOpacity 
            style={[styles.navButton, currentSlide === 0 && styles.hidden]}
            onPress={prevSlide}
          >
            <Ionicons name="chevron-back" size={20} color="#34C759" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.getStartedButton} onPress={nextSlide}>
            <Text style={styles.getStartedText}>
              {currentSlide === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const AuthScreen = ({ navigation, setUser }) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');


  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    let strength = 0;
    let feedback = '';

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    
    if (strength <= 2) {
      feedback = 'Weak';
    } else if (strength <= 4) {
      feedback = 'Medium';
    } else {
      feedback = 'Strong';
    }

    setPasswordStrength(feedback);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'Weak': return '#FF3B30';
      case 'Medium': return '#FF9500';
      case 'Strong': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    checkPasswordStrength(text);
  };

  const handleMockAuth = () => {
    const mockUser = {
      uid: 'mock-user-123',
      email: email || 'user@example.com',
      displayName: name || 'Test User'
    };
    setUser(mockUser);
    navigation.replace('home');
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigation.replace('home');
    } catch (error) {
      console.log('Firebase auth failed, using mock:', error.message);
      
      Alert.alert(
        'Firebase Unavailable',
        'Using demo mode. For full features, check Firebase configuration.',
        [
          {
            text: 'Use Demo Mode',
            onPress: handleMockAuth
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
      });

      setUser(userCredential.user);
      navigation.replace('home');
    } catch (error) {
      console.log('Firebase signup failed, using mock:', error.message);
      
      Alert.alert(
        'Firebase Unavailable',
        'Using demo mode. For full features, check Firebase configuration.',
        [
          {
            text: 'Use Demo Mode',
            onPress: handleMockAuth
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const enableMockMode = () => {
    Alert.alert(
      'Enable Demo Mode',
      'This will use mock authentication without Firebase.',
      [
        {
          text: 'Enable Demo',
          onPress: () => {
            setUseMock(true);
            handleMockAuth();
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome to HotelSA</Text>
          
          {/* Debug button */}
          <TouchableOpacity style={styles.debugButton} onPress={enableMockMode}>
            <Text style={styles.debugButtonText}>Trouble signing in? Use Demo Mode</Text>
          </TouchableOpacity>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
              onPress={() => setActiveTab('signin')}
            >
              <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.authContent}>
            {activeTab === 'signin' ? (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#8E8E93"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#8E8E93"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#8E8E93" 
                    />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={[styles.button, loading && styles.disabledButton]} 
                  onPress={useMock ? handleMockAuth : handleSignIn}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.textButton} onPress={handleForgotPassword}>
                  <Text style={styles.textButtonText}>Forgot Password?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8E8E93"
                  value={name}
                  onChangeText={setName}
                />
                
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#8E8E93"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#8E8E93"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#8E8E93" 
                    />
                  </TouchableOpacity>
                </View>

                {/* Password Strength Indicator */}
                {passwordStrength && (
                  <View style={styles.passwordStrengthContainer}>
                    <Text style={styles.passwordStrengthLabel}>Password strength:</Text>
                    <Text style={[
                      styles.passwordStrengthText,
                      { color: getPasswordStrengthColor() }
                    ]}>
                      {passwordStrength}
                    </Text>
                    <View style={styles.strengthBar}>
                      <View style={[
                        styles.strengthFill,
                        { 
                          width: passwordStrength === 'Weak' ? '33%' : 
                                 passwordStrength === 'Medium' ? '66%' : '100%',
                          backgroundColor: getPasswordStrengthColor()
                        }
                      ]} />
                    </View>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={[styles.button, loading && styles.disabledButton]} 
                  onPress={useMock ? handleMockAuth : handleSignUp}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const HomeScreen = ({ navigation, user }) => {
  const featuredHotels = [
    { 
      id: 1, 
      name: 'The Silo Hotel', 
      location: 'Cape Town', 
      price: 4500, 
      rating: 4.9,
    },
    { 
      id: 2, 
      name: 'Singita Kruger National Park', 
      location: 'Mpumalanga', 
      price: 3200, 
      rating: 4.8,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.homeHeader}>
          <Text style={styles.welcomeTitle}>Hello, {user?.displayName || 'Guest'} 👋</Text>
          <Text style={styles.subtitle}>Find your perfect stay in South Africa</Text>
        </View>

        <Text style={styles.sectionTitle}>Featured Hotels</Text>
        {featuredHotels.map(hotel => (
          <TouchableOpacity 
            key={hotel.id} 
            style={styles.hotelCard}
            onPress={() => navigation.navigate('hotelDetails')}
          >
            <Image 
              source={{ uri: HOTEL_IMAGES[hotel.name] }} 
              style={styles.hotelImage}
              resizeMode="cover"
            />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <Text style={styles.hotelLocation}>{hotel.location}</Text>
              <View style={styles.hotelDetails}>
                <StarRating rating={hotel.rating} size={16} />
                <Text style={styles.hotelPrice}>R{hotel.price}/night</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('home')}>
          <Ionicons name="home" size={22} color="#34C759" />
          <Text style={[styles.tabText, styles.activeTabText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('explore')}>
          <Ionicons name="search" size={22} color="#8E8E93" />
          <Text style={styles.tabText}>Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('profile')}>
          <Ionicons name="person" size={22} color="#8E8E93" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ExploreScreen = ({ navigation, user }) => {
  const hotels = [
    { 
      id: 1, 
      name: 'The Silo Hotel', 
      location: 'Cape Town', 
      price: 4500, 
      rating: 4.9, 
      city: 'Cape Town'
    },
    { 
      id: 2, 
      name: 'Singita Kruger National Park', 
      location: 'Mpumalanga', 
      price: 3200, 
      rating: 4.8, 
      city: 'Skukuza'
    },
    { 
      id: 3, 
      name: 'One&Only Cape Town', 
      location: 'Cape Town', 
      price: 3800, 
      rating: 4.7, 
      city: 'Cape Town'
    },
    { 
      id: 4, 
      name: 'The Oyster Box', 
      location: 'Durban', 
      price: 2800, 
      rating: 4.6, 
      city: 'Durban'
    },
    { 
      id: 5, 
      name: 'The Saxon Hotel', 
      location: 'Johannesburg', 
      price: 3500, 
      rating: 4.8, 
      city: 'Johannesburg'
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.screenHeader}>
          <Text style={styles.title}>Explore Hotels</Text>
        </View>
        
        {hotels.map(hotel => (
          <TouchableOpacity 
            key={hotel.id} 
            style={styles.hotelCard}
            onPress={() => navigation.navigate('hotelDetails')}
          >
            <Image 
              source={{ uri: HOTEL_IMAGES[hotel.name] }} 
              style={styles.hotelImage}
              resizeMode="cover"
            />
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <Text style={styles.hotelLocation}>{hotel.location}</Text>
              <View style={styles.hotelDetails}>
                <StarRating rating={hotel.rating} size={16} />
                <Text style={styles.hotelPrice}>R{hotel.price}/night</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('home')}>
          <Ionicons name="home" size={22} color="#8E8E93" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('explore')}>
          <Ionicons name="search" size={22} color="#34C759" />
          <Text style={[styles.tabText, styles.activeTabText]}>Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('profile')}>
          <Ionicons name="person" size={22} color="#8E8E93" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HotelDetailsScreen = ({ navigation, user }) => {
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    // Fetch reviews from Firestore
    const fetchReviews = async () => {
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('hotelId', '==', '1'), // Assuming hotel ID 1 for The Silo
          orderBy('createdAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
          const reviewsData = [];
          snapshot.forEach((doc) => {
            reviewsData.push({ id: doc.id, ...doc.data() });
          });
          setReviews(reviewsData);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();

    // Mock weather data
    setTimeout(() => {
      setWeather({ temp: 22, condition: 'Sunny', icon: '☀️' });
    }, 1000);
  }, []);

  const sampleReviews = [
    {
      id: 1,
      user: 'Sarah M.',
      rating: 5,
      comment: 'Absolutely stunning views and exceptional service!',
      date: '2024-10-15',
    },
  ];

  const displayReviews = reviews.length > 0 ? reviews : sampleReviews;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: HOTEL_IMAGES['The Silo Hotel'] }} 
          style={styles.hotelDetailImage}
          resizeMode="cover"
        />
        
        <View style={styles.hotelDetailContent}>
          <Text style={styles.title}>The Silo Hotel</Text>
          <Text style={styles.subtitle}>Cape Town, South Africa</Text>
          
          <View style={styles.hotelStats}>
            <StarRating rating={4.9} size={20} />
            <Text style={styles.stat}>R4,500/night</Text>
          </View>

          {/* Weather Information */}
          <View style={styles.weatherCard}>
            <Text style={styles.weatherTitle}>Current Weather in Cape Town</Text>
            {weather ? (
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherEmoji}>{weather.icon}</Text>
                <View style={styles.weatherDetails}>
                  <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                  <Text style={styles.weatherCondition}>{weather.condition}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.weatherText}>Loading weather...</Text>
            )}
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              if (!user) {
                Alert.alert('Sign In Required', 'Please sign in to book a hotel.');
                navigation.navigate('auth');
              } else {
                navigation.navigate('booking');
              }
            }}
          >
            <Text style={styles.buttonText}>Book Now</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              if (!user) {
                Alert.alert('Sign In Required', 'Please sign in to rate this hotel.');
                navigation.navigate('auth');
              } else {
                navigation.navigate('rating');
              }
            }}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Rate This Hotel</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            The Silo Hotel is a luxurious 5-star hotel located in the V&A Waterfront with breathtaking views of Table Mountain and the Atlantic Ocean. Featuring stunning architecture and world-class amenities.
          </Text>

          <Text style={styles.sectionTitle}>Guest Reviews</Text>
          {displayReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.userName || review.user}</Text>
                <StarRating rating={review.rating} size={16} />
              </View>
              <Text style={styles.reviewDate}>
                {review.createdAt?.toDate?.().toLocaleDateString() || review.date}
              </Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}

          {displayReviews.length === 0 && (
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const RatingScreen = ({ navigation, user }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to submit a review.');
      navigation.navigate('auth');
      return;
    }

    if (!review.trim()) {
      Alert.alert('Error', 'Please write a review before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Save review to Firestore
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        hotelId: '1',
        hotelName: 'The Silo Hotel',
        rating: rating,
        comment: review,
        createdAt: new Date(),
      });

      Alert.alert('Thank You! 🌟', 'Your review has been submitted successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>The Silo Hotel</Text>
          <Text style={styles.ratingSubtitle}>How was your experience?</Text>
          
          <View style={styles.starRatingLarge}>
            <StarRating 
              rating={rating} 
              onRatingChange={setRating} 
              size={40} 
              editable={true} 
            />
          </View>
          
          <Text style={styles.ratingValue}>{rating}.0 out of 5</Text>

          <Text style={styles.label}>Your Review</Text>
          <TextInput
            style={styles.textArea}
            value={review}
            onChangeText={setReview}
            placeholder="Share details of your own experience at this hotel..."
            placeholderTextColor="#8E8E93"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleSubmitReview}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const BookingScreen = ({ navigation, user }) => {
  const [checkInDate, setCheckInDate] = useState('2024-11-15');
  const [checkOutDate, setCheckOutDate] = useState('2024-11-20');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    const nights = 5; // Simplified calculation
    return nights * 4500 * parseInt(rooms);
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to book a hotel.');
      navigation.navigate('auth');
      return;
    }

    setLoading(true);
    try {
      // Save booking to Firestore
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        hotelId: '1',
        hotelName: 'The Silo Hotel',
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guests: parseInt(guests),
        rooms: parseInt(rooms),
        total: calculateTotal(),
        status: 'confirmed',
        createdAt: new Date(),
      });

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your booking at The Silo Hotel has been confirmed.\n\nCheck-in: ${checkInDate}\nCheck-out: ${checkOutDate}\nTotal: R${calculateTotal()}`,
        [{ 
          text: 'OK', 
          onPress: () => navigation.replace('home')
        }]
      );
    } catch (error) {
      Alert.alert('Booking Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Book Your Stay</Text>
        
        <View style={styles.bookingCard}>
          <Text style={styles.bookingTitle}>The Silo Hotel</Text>
          <Text style={styles.bookingDate}>R4,500 per night</Text>
          <Text style={styles.bookingLocation}>Cape Town, South Africa</Text>
        </View>

        <Text style={styles.label}>Check-in Date</Text>
        <TextInput
          style={styles.input}
          value={checkInDate}
          onChangeText={setCheckInDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#8E8E93"
        />

        <Text style={styles.label}>Check-out Date</Text>
        <TextInput
          style={styles.input}
          value={checkOutDate}
          onChangeText={setCheckOutDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#8E8E93"
        />

        <Text style={styles.label}>Guests</Text>
        <TextInput
          style={styles.input}
          value={guests}
          onChangeText={setGuests}
          keyboardType="numeric"
          placeholderTextColor="#8E8E93"
        />

        <Text style={styles.label}>Rooms</Text>
        <TextInput
          style={styles.input}
          value={rooms}
          onChangeText={setRooms}
          keyboardType="numeric"
          placeholderTextColor="#8E8E93"
        />

        <View style={styles.priceSummary}>
          <Text style={styles.priceLabel}>5 nights x R4,500</Text>
          <Text style={styles.priceValue}>R{calculateTotal()}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Confirming...' : `Confirm Booking - R${calculateTotal()}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const ProfileScreen = ({ navigation, user, setUser }) => {
  const [bookings, setBookings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = [];
      querySnapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() });
      });
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigation.replace('auth');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: name
      });

      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: name,
        updatedAt: new Date(),
      });

      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#000000" />
          </View>
          
          {editMode ? (
            <>
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#8E8E93"
              />
              <Text style={styles.subtitle}>{user?.email}</Text>
              
              <View style={styles.editButtons}>
                <TouchableOpacity 
                  style={[styles.button, styles.smallButton]} 
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.smallButton, styles.cancelButton]} 
                  onPress={() => setEditMode(false)}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>{user?.displayName || 'User'}</Text>
              <Text style={styles.subtitle}>{user?.email}</Text>
              
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setEditMode(true)}
              >
                <Text style={[styles.buttonText, styles.editButtonText]}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>My Bookings</Text>
        
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <Text style={styles.bookingTitle}>{booking.hotelName}</Text>
              <Text style={styles.bookingDate}>
                {booking.checkInDate} - {booking.checkOutDate}
              </Text>
              <Text style={styles.bookingStatus}>{booking.status}</Text>
              <Text style={styles.bookingTotal}>Total: R{booking.total}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noBookingsText}>No bookings yet</Text>
        )}

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('home')}>
          <Ionicons name="home" size={22} color="#8E8E93" />
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('explore')}>
          <Ionicons name="search" size={22} color="#8E8E93" />
          <Text style={styles.tabText}>Explore</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('profile')}>
          <Ionicons name="person" size={22} color="#34C759" />
          <Text style={[styles.tabText, styles.activeTabText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============ STYLES ============

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 15, // Added padding to prevent content touching top
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  // Onboarding Styles
  onboardingContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 40,
  },
  onboardingContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#34C759',
    width: 20,
  },
  onboardingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  hidden: {
    opacity: 0,
  },
  navButtonText: {
    color: '#34C759',
    fontSize: 16,
    fontFamily: 'Helvetica',
    marginLeft: 5,
  },
  getStartedButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  getStartedText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    marginRight: 5,
  },
  // Star Rating
  starContainer: {
    flexDirection: 'row',
  },
  starRatingLarge: {
    marginVertical: 20,
  },
  // Common Styles
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    fontFamily: 'Helvetica',
    marginBottom: 30,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 30,
  },
  emojiLarge: {
    fontSize: 100,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    marginHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  smallButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8E8E93',
  },
  cancelButtonText: {
    color: '#8E8E93',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  buttonText: {
    color: '#000000', // Force black text for better readability
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#34C759',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 40,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  editButtonText: {
    color: '#34C759',
  },
  textButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#34C759',
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  // Auth Styles
  authContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 4,
    marginBottom: 30,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#34C759',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  activeTabText: {
    color: '#000000', // Black text for active tab
  },
  authContent: {
    width: '100%',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Helvetica',
    marginBottom: 8,
    marginTop: 16,
    marginHorizontal: 20,
  },
  input: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  editInput: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#34C759',
    marginHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    height: 120,
    marginTop: 8,
    marginHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  // Password input styles
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
    paddingLeft: 10,
  },
  // Password strength styles
  passwordStrengthContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  passwordStrengthLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: 'Helvetica',
    marginBottom: 5,
  },
  passwordStrengthText: {
    fontSize: 14,
    fontFamily: 'Helvetica',
    fontWeight: '600',
    marginBottom: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#2C2C2E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'all 0.3s ease',
  },
  // Debug button styles
  debugButton: {
    backgroundColor: '#FF6B35',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#000000', // Black text for better readability
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  // Hotel Cards
  homeHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  screenHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    marginBottom: 15,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  hotelCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: 15,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Helvetica',
    marginBottom: 6,
  },
  hotelDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotelRating: {
    fontSize: 14,
    color: '#34C759',
    fontFamily: 'Helvetica',
  },
  hotelPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  hotelDetailImage: {
    width: '100%',
    height: 300,
  },
  hotelDetailContent: {
    padding: 20,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  quickAction: {
    backgroundColor: '#1C1C1E',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '48%',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Helvetica',
    fontWeight: '600',
    marginTop: 8,
  },
  // Bottom Tabs
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingBottom: 5,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'Helvetica',
    marginTop: 4,
  },
  activeTabText: {
    color: '#34C759',
  },
  // Profile
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  bookingCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    marginBottom: 5,
  },
  bookingDate: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'Helvetica',
    marginBottom: 8,
  },
  bookingLocation: {
    fontSize: 14,
    color: '#34C759',
    fontFamily: 'Helvetica',
  },
  bookingStatus: {
    fontSize: 14,
    color: '#34C759',
    fontFamily: 'Helvetica',
    fontWeight: '600',
  },
  bookingTotal: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontWeight: '600',
    marginTop: 5,
  },
  noBookingsText: {
    color: '#8E8E93',
    fontSize: 16,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  // Hotel Details
  hotelStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  stat: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Helvetica',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Weather Card
  weatherCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  weatherTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    marginBottom: 10,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  weatherDetails: {
    flex: 1,
  },
  weatherTemp: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
  },
  weatherCondition: {
    color: '#8E8E93',
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  weatherText: {
    color: '#8E8E93',
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  // Reviews
  reviewCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewUser: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  reviewDate: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'Helvetica',
    marginBottom: 8,
  },
  reviewComment: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Helvetica',
    lineHeight: 20,
  },
  noReviewsText: {
    color: '#8E8E93',
    fontSize: 16,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Rating Screen
  ratingContainer: {
    padding: 20,
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 5,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 30,
  },
  ratingValue: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Price Summary
  priceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  priceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  priceValue: {
    color: '#34C759',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Helvetica',
  },
});

export default App;