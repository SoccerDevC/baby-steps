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
  const lastPoint = useRef({ x: 0, y: 0 });

  const addTrailPoint = (x: number, y: number) => {
    // Calculate distance from last point
    const dx = x - lastPoint.current.x;
    const dy = y - lastPoint.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If distance is significant, add intermediate points
    if (distance > 5) {
      const steps = Math.floor(distance / 5);
      for (let i = 1; i <= steps; i++) {
        const ratio = i / steps;
        const interpolatedX = lastPoint.current.x + dx * ratio;
        const interpolatedY = lastPoint.current.y + dy * ratio;
        setTrail(currentTrail => [
          ...currentTrail,
          {
            x: interpolatedX,
            y: interpolatedY,
            id: nextId.current++
          }
        ]);
      }
    }
    
    lastPoint.current = { x, y };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        Animated.event([
          null,
          { dx: pan.x, dy: pan.y }
        ], { useNativeDriver: false })(_, gestureState);

        addTrailPoint(gestureState.moveX, gestureState.moveY);
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
              left: point.x - 30, // Offset by half the width
              top: point.y - 30,  // Offset by half the height
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    position: 'absolute',
  }
});
