import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { globalStyles, colors, typography, spacing } from '../../styles/global';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
    } catch (error) {
      Alert.alert('Password Reset Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[globalStyles.screen, { justifyContent: 'center' }]}>
        <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Reset Password</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>
        
        <TextInput
          style={[globalStyles.input, { marginBottom: spacing.lg }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TouchableOpacity
          style={globalStyles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ marginTop: spacing.md }}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={[typography.caption, { textAlign: 'center', color: colors.accent }]}>
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;