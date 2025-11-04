import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const GOLDEN_RATIO = 1.618;

export const colors = {
  primary: '#000000',
  secondary: '#1a1a1a',
  accent: '#34C759',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#2C2C2E',
  background: '#000000',
  card: '#1C1C1E',
};

export const typography = {
  h1: {
    fontSize: 28,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: Math.round(28 / GOLDEN_RATIO),
    fontFamily: 'Helvetica',
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: Math.round(28 / (GOLDEN_RATIO * 1.5)),
    fontFamily: 'Helvetica',
    color: colors.text,
  },
  caption: {
    fontSize: Math.round(28 / (GOLDEN_RATIO * 2)),
    fontFamily: 'Helvetica',
    color: colors.textSecondary,
  },
};

export const spacing = {
  xs: Math.round(width * 0.02),
  sm: Math.round(width * 0.04),
  md: Math.round(width * 0.06),
  lg: Math.round(width * 0.08),
  xl: Math.round(width * 0.12),
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: Math.round(width * 0.04),
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: Math.round(width * 0.02),
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.secondary,
    borderRadius: Math.round(width * 0.02),
    padding: spacing.sm,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hiddenScroll: {
    flex: 1,
  },
});