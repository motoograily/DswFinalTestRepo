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
import { auth } from '../../mockFirebase'; // Import mock instead of real Firebase
import { globalStyles, colors, typography, spacing } from '../../styles/global';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Use mock Firebase
      await auth.signInWithEmailAndPassword(email, password);
      console.log('✅ Mock sign in successful');
      // Navigation handled by auth state listener
    } catch (error) {
      console.error('Mock sign in error:', error);
      Alert.alert('Sign In Failed', 'Invalid email or password');
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
        <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Welcome Back</Text>
        
        <TextInput
          style={[globalStyles.input, { marginBottom: spacing.md }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={[globalStyles.input, { marginBottom: spacing.lg }]}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={globalStyles.button}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ marginTop: spacing.md }}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={[typography.caption, { textAlign: 'center' }]}>
            Don't have an account? <Text style={{ color: colors.accent }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ marginTop: spacing.sm }}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={[typography.caption, { textAlign: 'center', color: colors.accent }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;