import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { globalStyles, colors, typography, spacing } from '../styles/global';
import { auth } from '../firebase';

const HotelDetailsScreen = ({ route, navigation }) => {
  const { hotel } = route.params;
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  const reviews = [
    {
      id: 1,
      user: 'John D.',
      rating: 5,
      comment: 'Amazing stay! The service was exceptional.',
      date: '2024-10-15',
    },
    {
      id: 2,
      user: 'Sarah M.',
      rating: 4,
      comment: 'Great location and comfortable rooms.',
      date: '2024-10-10',
    },
  ];

  const handleBookNow = () => {
    if (!auth.currentUser) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to book a hotel.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Auth') }
        ]
      );
      return;
    }
    navigation.navigate('Booking', { hotel });
  };

  const handleAddReview = () => {
    if (!auth.currentUser) {
      Alert.alert('Sign In Required', 'Please sign in to add a review.');
      return;
    }
    setShowReviewModal(true);
  };

  const submitReview = () => {
    // Here you would normally save to Firebase
    Alert.alert('Review Submitted', 'Thank you for your review!');
    setShowReviewModal(false);
    setReviewText('');
    setRating(5);
  };

  const renderStars = (currentRating, setRatingFn = null) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRatingFn && setRatingFn(star)}
            disabled={!setRatingFn}
          >
            <Text style={{ fontSize: 24, color: star <= currentRating ? '#FFD700' : colors.textSecondary }}>
              {star <= currentRating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView 
        style={globalStyles.hiddenScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.screen}>
          {/* Hotel Header */}
          <View style={globalStyles.card}>
            <Text style={{ fontSize: 60, textAlign: 'center', marginBottom: spacing.md }}>
              {hotel.image}
            </Text>
            <Text style={typography.h1}>{hotel.name}</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>
              {hotel.location}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
              <Text style={[typography.caption, { color: colors.accent }]}>
                ⭐ {hotel.rating}
              </Text>
              <Text style={typography.h2}>${hotel.price}/night</Text>
            </View>
          </View>

          {/* Book Now Button */}
          <TouchableOpacity style={globalStyles.button} onPress={handleBookNow}>
            <Text style={globalStyles.buttonText}>Book Now</Text>
          </TouchableOpacity>

          {/* Reviews Section */}
          <View style={[globalStyles.card, { marginTop: spacing.lg }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={typography.h2}>Reviews</Text>
              <TouchableOpacity onPress={handleAddReview}>
                <Text style={[typography.caption, { color: colors.accent }]}>Add Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                No reviews yet. Be the first to review!
              </Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={{ marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                    <Text style={typography.body}>{review.user}</Text>
                    {renderStars(review.rating)}
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{review.date}</Text>
                  <Text style={[typography.body, { marginTop: spacing.xs }]}>{review.comment}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: spacing.md }}>
          <View style={[globalStyles.card, { margin: spacing.md }]}>
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>Add Review</Text>
            
            <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
              {renderStars(rating, setRating)}
            </View>
            
            <TextInput
              style={[globalStyles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Write your review..."
              placeholderTextColor={colors.textSecondary}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1, marginRight: spacing.sm, backgroundColor: colors.textSecondary }]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.button, { flex: 1, marginLeft: spacing.sm }]}
                onPress={submitReview}
              >
                <Text style={globalStyles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HotelDetailsScreen;