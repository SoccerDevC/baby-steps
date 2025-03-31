import { StyleSheet, Animated, PanResponder, View, Pressable } from 'react-native';
import { useRef, useState } from 'react';
import { ThemedView } from '@/components/ThemedView';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  color: string;
}

const COLORS = [
  '#FFD700', // Gold
  '#FF0000', // Red
  '#00FF00', // Lime
  '#0000FF', // Blue
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
];

export default function HomeScreen() {
  const pan = useRef(new Animated.ValueXY()).current;
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
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
            id: nextId.current++,
            color: currentColor
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
      {/* Drawing Area */}
      <View style={styles.drawingArea}>
        {/* Render trail points */}
        {trail.map((point) => (
          <View
            key={point.id}
            style={[
              styles.trailPoint,
              {
                left: point.x - 30,
                top: point.y - 30,
                backgroundColor: point.color + '4D', // Adding 30% opacity
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
              ],
              backgroundColor: currentColor,
            }
          ]}
          {...panResponder.panHandlers}
        />
      </View>

      {/* Color Picker */}
      <View style={styles.colorPicker}>
        {COLORS.map((color, index) => (
          <Pressable
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color }
            ]}
            onPress={() => setCurrentColor(color)}
          />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // For landscape mode
  },
  drawingArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  colorPicker: {
    width: 80,
    backgroundColor: '#e0e0e0',
    padding: 10,
    gap: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
  },
  trailPoint: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
    borderColor: '#fff',
  }
});
