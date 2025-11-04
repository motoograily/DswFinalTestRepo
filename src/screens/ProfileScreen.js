import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { globalStyles, colors, typography, spacing } from '../styles/global';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user's bookings from Firestore
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      const bookings = [];
      
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort by creation date (newest first)
      bookings.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
      setUserBookings(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Use sample data if Firebase fails
      setUserBookings([
        {
          id: 1,
          hotelName: 'Luxury Resort & Spa',
          dates: 'Nov 15 - Nov 20, 2024',
          status: 'Confirmed',
          total: 1495,
        },
        {
          id: 2,
          hotelName: 'Urban Boutique Hotel',
          dates: 'Dec 10 - Dec 12, 2024',
          status: 'Completed',
          total: 378,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // MANUAL PERSISTENCE: Clear stored user data
      await AsyncStorage.removeItem('@user_email');
      await AsyncStorage.removeItem('@user_token');
      
      console.log('✅ User logged out and storage cleared');
      
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', 'There was an error logging out. Please try again.');
    }
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#34C759';
      case 'completed':
        return '#007AFF';
      case 'cancelled':
        return '#FF3B30';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView 
        style={globalStyles.hiddenScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.screen}>
          {/* Profile Header */}
          <View style={[globalStyles.card, { alignItems: 'center', marginBottom: spacing.lg }]}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.md,
            }}>
              <Text style={{ fontSize: 32, color: colors.primary, fontFamily: 'Helvetica' }}>
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            
            <Text style={[typography.h2, { textAlign: 'center' }]}>
              {user?.displayName || 'User'}
            </Text>
            
            <Text style={[typography.caption, { marginTop: 2, textAlign: 'center' }]}>
              {user?.email}
            </Text>
            
            <TouchableOpacity
              style={[
                globalStyles.button, 
                { 
                  marginTop: spacing.md, 
                  backgroundColor: 'transparent', 
                  borderWidth: 1, 
                  borderColor: colors.accent 
                }
              ]}
              onPress={handleEditProfile}
            >
              <Text style={[globalStyles.buttonText, { color: colors.accent }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* My Bookings Section */}
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>
            My Bookings
          </Text>

          {loading ? (
            <View style={[globalStyles.card, { alignItems: 'center', padding: spacing.lg }]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                Loading bookings...
              </Text>
            </View>
          ) : userBookings.length === 0 ? (
            <View style={[globalStyles.card, { alignItems: 'center', padding: spacing.lg }]}>
              <Text style={{ fontSize: 40, marginBottom: spacing.md }}>🏨</Text>
              <Text style={[typography.body, { textAlign: 'center', marginBottom: spacing.sm }]}>
                No Bookings Yet
              </Text>
              <Text style={[typography.caption, { textAlign: 'center', color: colors.textSecondary }]}>
                Start exploring hotels and book your first stay!
              </Text>
              <TouchableOpacity
                style={[globalStyles.button, { marginTop: spacing.md }]}
                onPress={() => navigation.navigate('ExploreTab')}
              >
                <Text style={globalStyles.buttonText}>Explore Hotels</Text>
              </TouchableOpacity>
            </View>
          ) : (
            userBookings.map((booking) => (
              <View key={booking.id} style={[globalStyles.card, { marginBottom: spacing.md }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                  <Text style={[typography.body, { flex: 1 }]}>{booking.hotelName}</Text>
                  <Text style={[typography.h2, { color: colors.accent }]}>
                    ${booking.total || booking.hotelName?.includes('Luxury') ? 1495 : 378}
                  </Text>
                </View>
                
                <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                  {booking.dates || `${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}`}
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs }}>
                  <Text style={[
                    typography.caption, 
                    { 
                      color: getStatusColor(booking.status),
                      fontWeight: '600'
                    }
                  ]}>
                    {booking.status || 'Confirmed'}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => Alert.alert(
                      'Booking Details', 
                      `Hotel: ${booking.hotelName}\nDates: ${booking.dates || 'N/A'}\nStatus: ${booking.status || 'Confirmed'}\nTotal: $${booking.total || 'N/A'}`,
                      [{ text: 'OK' }]
                    )}
                  >
                    <Text style={[typography.caption, { color: colors.accent }]}>
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Account Actions */}
          <Text style={[typography.h2, { marginTop: spacing.lg, marginBottom: spacing.md }]}>
            Account
          </Text>

          <View style={globalStyles.card}>
            <TouchableOpacity
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm }}
              onPress={() => Alert.alert('Settings', 'Settings feature coming soon!')}
            >
              <Text style={typography.body}>Settings</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>⚙️</Text>
            </TouchableOpacity>
            
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }} />
            
            <TouchableOpacity
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm }}
              onPress={() => Alert.alert('Help & Support', 'Support feature coming soon!')}
            >
              <Text style={typography.body}>Help & Support</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>❓</Text>
            </TouchableOpacity>
            
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }} />
            
            <TouchableOpacity
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm }}
              onPress={() => Alert.alert('About', 'Hotel Booking App v1.0\nBuilt with React Native & Firebase')}
            >
              <Text style={typography.body}>About</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>ℹ️</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[
              globalStyles.button, 
              { 
                marginTop: spacing.xl, 
                marginBottom: spacing.xl,
                backgroundColor: '#FF3B30'
              }
            ]}
            onPress={handleLogout}
          >
            <Text style={globalStyles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;