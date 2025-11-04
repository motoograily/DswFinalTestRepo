import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { globalStyles, colors, typography, spacing } from '../styles/global';

const HomeScreen = ({ navigation }) => {
  const featuredHotels = [
    {
      id: 1,
      name: 'Luxury Resort & Spa',
      location: 'Bali, Indonesia',
      price: 299,
      rating: 4.8,
      image: '🏝️',
    },
    {
      id: 2,
      name: 'Urban Boutique Hotel',
      location: 'New York, USA',
      price: 189,
      rating: 4.6,
      image: '🏙️',
    },
  ];

  return (
    <View style={globalStyles.container}>
      <ScrollView 
        style={globalStyles.hiddenScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.screen}>
          {/* Header */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={typography.h1}>Find Your Perfect Stay</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              Discover amazing hotels worldwide
            </Text>
          </View>

          {/* Featured Hotels */}
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>Featured</Text>
          {featuredHotels.map((hotel) => (
            <TouchableOpacity
              key={hotel.id}
              style={globalStyles.card}
              onPress={() => navigation.navigate('HotelDetails', { hotel })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 40, marginRight: spacing.md }}>{hotel.image}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={typography.body}>{hotel.name}</Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>{hotel.location}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                    <Text style={[typography.caption, { color: colors.accent }]}>
                      ⭐ {hotel.rating}
                    </Text>
                    <Text style={typography.body}>${hotel.price}/night</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Quick Actions */}
          <Text style={[typography.h2, { marginTop: spacing.lg, marginBottom: spacing.md }]}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[globalStyles.card, { width: '48%' }]}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>🔍</Text>
              <Text style={typography.body}>Explore</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[globalStyles.card, { width: '48%' }]}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={{ fontSize: 24, marginBottom: spacing.xs }}>👤</Text>
              <Text style={typography.body}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;