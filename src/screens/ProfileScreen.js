import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { globalStyles, colors, typography, spacing } from '../styles/global';

const ProfileScreen = ({ navigation }) => {
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  const userBookings = [
    {
      id: 1,
      hotelName: 'Luxury Resort & Spa',
      dates: 'Nov 15 - Nov 20, 2024',
      status: 'Confirmed',
    },
    {
      id: 2,
      hotelName: 'Urban Boutique Hotel',
      dates: 'Dec 10 - Dec 12, 2024',
      status: 'Completed',
    },
  ];

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
              <Text style={{ fontSize: 32, color: colors.primary }}>
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={typography.h2}>{user?.displayName || 'User'}</Text>
            <Text style={[typography.caption, { marginTop: 2 }]}>{user?.email}</Text>
            
            <TouchableOpacity
              style={[globalStyles.button, { marginTop: spacing.md, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.accent }]}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={[globalStyles.buttonText, { color: colors.accent }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* My Bookings */}
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>My Bookings</Text>
          {userBookings.map((booking) => (
            <View key={booking.id} style={globalStyles.card}>
              <Text style={typography.body}>{booking.hotelName}</Text>
              <Text style={[typography.caption, { marginTop: 2 }]}>{booking.dates}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                <Text style={[typography.caption, { color: colors.accent }]}>
                  {booking.status}
                </Text>
                <TouchableOpacity>
                  <Text style={[typography.caption, { color: colors.accent }]}>
                    View Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            style={[globalStyles.button, { marginTop: spacing.xl, backgroundColor: '#FF3B30' }]}
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