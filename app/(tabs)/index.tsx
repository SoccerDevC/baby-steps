import { StyleSheet, Animated, PanResponder, View } from 'react-native';
import { useRef, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export default function HomeScreen() {
  const pan = useRef(new Animated.ValueXY()).current;
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const nextId = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        Animated.event([
          null,
          { dx: pan.x, dy: pan.y }
        ], { useNativeDriver: false })(_, gestureState);

        // Add new point to trail
        setTrail(currentTrail => [
          ...currentTrail,
          {
            x: gestureState.moveX,
            y: gestureState.moveY,
            id: nextId.current++
          }
        ]);
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false
        }).start();
      }
    })
  ).current;

  return (
    <ThemedView style={styles.container}>
      {/* Render trail points */}
      {trail.map((point) => (
        <View
          key={point.id}
          style={[
            styles.trailPoint,
            {
              left: point.x - 10, // Offset by half the width
              top: point.y - 10,  // Offset by half the height
            }
          ]}
        />
      ))}
      
      {/* Moving ball */}
      <Animated.View
        style={[
          styles.ball,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'yellow',
    position: 'absolute',
  },
  trailPoint: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    position: 'absolute',
  }
});
