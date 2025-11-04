import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { globalStyles, colors, typography, spacing } from '../styles/global';

const ExploreScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const hotels = [
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
    {
      id: 3,
      name: 'Mountain Retreat',
      location: 'Swiss Alps',
      price: 159,
      rating: 4.7,
      image: '🏔️',
    },
    {
      id: 4,
      name: 'Beachfront Villa',
      location: 'Maldives',
      price: 399,
      rating: 4.9,
      image: '🏖️',
    },
  ];

  const filteredHotels = hotels
    .filter(hotel => 
      hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const renderHotelCard = ({ item }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 40, marginRight: spacing.md }}>{item.image}</Text>
        <View style={{ flex: 1 }}>
          <Text style={typography.body}>{item.name}</Text>
          <Text style={[typography.caption, { marginTop: 2 }]}>{item.location}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
            <Text style={[typography.caption, { color: colors.accent }]}>
              ⭐ {item.rating}
            </Text>
            <Text style={typography.body}>${item.price}/night</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.screen}>
        {/* Search Bar */}
        <TextInput
          style={[globalStyles.input, { marginBottom: spacing.md }]}
          placeholder="Search hotels or locations..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Sort Options */}
        <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              backgroundColor: sortBy === 'rating' ? colors.accent : colors.secondary,
              borderRadius: 20,
              marginRight: spacing.sm,
            }}
            onPress={() => setSortBy('rating')}
          >
            <Text style={[typography.caption, { color: sortBy === 'rating' ? colors.primary : colors.text }]}>
              Top Rated
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.xs,
              backgroundColor: sortBy === 'price' ? colors.accent : colors.secondary,
              borderRadius: 20,
            }}
            onPress={() => setSortBy('price')}
          >
            <Text style={[typography.caption, { color: sortBy === 'price' ? colors.primary : colors.text }]}>
              Price
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hotel List */}
        <FlatList
          data={filteredHotels}
          renderItem={renderHotelCard}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        />
      </View>
    </View>
  );
};

export default ExploreScreen;