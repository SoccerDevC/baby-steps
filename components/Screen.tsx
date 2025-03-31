import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';

interface ScreenProps {
  children: React.ReactNode;
  forceLandscape?: boolean;
}

export function Screen({ children, forceLandscape }: ScreenProps) {
  useEffect(() => {
    if (forceLandscape) {
      // Lock to landscape orientation
      Dimensions.addEventListener('change', () => {
        const { width, height } = Dimensions.get('window');
        if (width < height) {
          // Force landscape if in portrait
          Dimensions.set({ width: height, height: width });
        }
      });
    }
  }, [forceLandscape]);

  return (
    <View style={{ 
      flex: 1,
      width: '100%',
      height: '100%',
      transform: forceLandscape ? [{ rotate: '90deg' }] : []
    }}>
      {children}
    </View>
  );
}
