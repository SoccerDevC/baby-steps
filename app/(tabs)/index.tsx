import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
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
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [nextId, setNextId] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  const addTrailPoint = (x: number, y: number) => {
    if (!isDrawing) return;

    // Calculate distance from last point
    const dx = x - lastPoint.x;
    const dy = y - lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If distance is significant, add intermediate points
    if (distance > 5) {
      const steps = Math.floor(distance / 5);
      for (let i = 1; i <= steps; i++) {
        const ratio = i / steps;
        const interpolatedX = lastPoint.x + dx * ratio;
        const interpolatedY = lastPoint.y + dy * ratio;
        setTrail(currentTrail => [
          ...currentTrail,
          {
            x: interpolatedX,
            y: interpolatedY,
            id: nextId + i,
            color: currentColor
          }
        ]);
      }
      setNextId(nextId + steps);
    }
    
    setLastPoint({ x, y });
  };

  const handleTouchStart = (event: any) => {
    const touch = event.nativeEvent;
    setIsDrawing(true);
    setLastPoint({ x: touch.pageX, y: touch.pageY });
    // Add first point immediately
    setTrail(currentTrail => [
      ...currentTrail,
      {
        x: touch.pageX,
        y: touch.pageY,
        id: nextId,
        color: currentColor
      }
    ]);
    setNextId(nextId + 1);
  };

  const handleTouchMove = (event: any) => {
    const touch = event.nativeEvent;
    addTrailPoint(touch.pageX, touch.pageY);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Drawing Area */}
      <View 
        style={styles.drawingArea}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
      </View>

      {/* Color Picker */}
      <View style={styles.colorPicker}>
        {COLORS.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorOption,
              { 
                backgroundColor: color,
                borderWidth: color === currentColor ? 4 : 2,
              }
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
    flexDirection: 'row',
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
    borderColor: '#fff',
  }
});
