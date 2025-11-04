import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { globalStyles, colors, typography, spacing } from '../styles/global';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const BookingScreen = ({ route, navigation }) => {
  const { hotel } = route.params;
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState('1');
  const [rooms, setRooms] = useState('1');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    const nights = 1; // Simplified calculation
    return nights * hotel.price * parseInt(rooms);
  };

  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      Alert.alert('Error', 'Please select check-in and check-out dates');
      return;
    }

    if (parseInt(guests) < 1 || parseInt(rooms) < 1) {
      Alert.alert('Error', 'Please enter valid number of guests and rooms');
      return;
    }

    setLoading(true);
    try {
      // Save booking to Firebase
      await addDoc(collection(db, 'bookings'), {
        userId: auth.currentUser.uid,
        hotelId: hotel.id,
        hotelName: hotel.name,
        checkInDate,
        checkOutDate,
        guests: parseInt(guests),
        rooms: parseInt(rooms),
        total: calculateTotal(),
        status: 'confirmed',
        createdAt: new Date(),
      });

      Alert.alert(
        'Booking Confirmed!',
        `Your booking at ${hotel.name} has been confirmed. Total: $${calculateTotal()}`,
        [{ text: 'OK', onPress: () => navigation.navigate('HomeTab') }]
      );
    } catch (error) {
      Alert.alert('Booking Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView 
        style={globalStyles.hiddenScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.screen}>
          {/* Hotel Summary */}
          <View style={globalStyles.card}>
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>Booking Summary</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 40, marginRight: spacing.md }}>{hotel.image}</Text>
              <View style={{ flex: 1 }}>
                <Text style={typography.body}>{hotel.name}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{hotel.location}</Text>
                <Text style={[typography.body, { color: colors.accent, marginTop: spacing.xs }]}>
                  ${hotel.price}/night
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Details */}
          <View style={[globalStyles.card, { marginTop: spacing.md }]}>
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>Booking Details</Text>
            
            <Text style={[typography.body, { marginBottom: spacing.xs }]}>Check-in Date</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={checkInDate}
              onChangeText={setCheckInDate}
            />
            
            <Text style={[typography.body, { marginTop: spacing.md, marginBottom: spacing.xs }]}>Check-out Date</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              value={checkOutDate}
              onChangeText={setCheckOutDate}
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Text style={[typography.body, { marginBottom: spacing.xs }]}>Guests</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  value={guests}
                  onChangeText={setGuests}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={[typography.body, { marginBottom: spacing.xs }]}>Rooms</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="1"
                  placeholderTextColor={colors.textSecondary}
                  value={rooms}
                  onChangeText={setRooms}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Price Summary */}
          <View style={[globalStyles.card, { marginTop: spacing.md }]}>
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>Price Summary</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
              <Text style={typography.body}>${hotel.price} x {rooms} room(s) x 1 night</Text>
              <Text style={typography.body}>${hotel.price * parseInt(rooms)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={[typography.h2, { color: colors.accent }]}>Total</Text>
              <Text style={[typography.h2, { color: colors.accent }]}>${calculateTotal()}</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[globalStyles.button, { marginTop: spacing.lg }]}
            onPress={handleConfirmBooking}
            disabled={loading}
          >
            <Text style={globalStyles.buttonText}>
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default BookingScreen;