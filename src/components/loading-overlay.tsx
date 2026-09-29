import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Palette, Spacing } from '@/constants/theme';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  transparent?: boolean;
}

export function LoadingOverlay({
  visible,
  message,
  size = 'large',
  color = Palette.primary,
  transparent = true,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.overlay,
        transparent ? styles.overlayTransparent : styles.overlaySolid,
      ]}
      pointerEvents="auto"
    >
      <View style={styles.badge}>
        <ActivityIndicator size={size} color={color} />
        {message ? <ThemedText style={styles.messageText}>{message}</ThemedText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  overlayTransparent: {
    backgroundColor: 'rgba(16, 20, 21, 0.55)',
  },
  overlaySolid: {
    backgroundColor: Palette.background,
  },
  badge: {
    backgroundColor: Palette.surfaceContainer,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  messageText: {
    fontSize: 13,
    color: Palette.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
});
