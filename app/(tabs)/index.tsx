import { StyleSheet, View, Pressable, SafeAreaView, ImageBackground } from "react-native"
import { useState } from "react"
import { ThemedView } from "@/components/ThemedView"

interface TrailPoint {
  x: number
  y: number
  id: number
  color: string
}

const COLORS = [
  "#FFD700", "#FF0000", "#00FF00", "#0000FF",
  "#FF00FF", "#00FFFF", "#FFA500", "#800080",
]

const MAX_TRAIL_POINTS = 500

export default function HomeScreen() {
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [currentColor, setCurrentColor] = useState(COLORS[0])
  const [nextId, setNextId] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 })

  const addTrailPoint = (x: number, y: number) => {
    if (!isDrawing) return

    const dx = x - lastPoint.x
    const dy = y - lastPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 5) {
      const steps = Math.floor(distance / 5)
      const newPoints: TrailPoint[] = []

      for (let i = 1; i <= steps; i++) {
        const ratio = i / steps
        const interpolatedX = lastPoint.x + dx * ratio
        const interpolatedY = lastPoint.y + dy * ratio
        newPoints.push({
          x: interpolatedX,
          y: interpolatedY,
          id: nextId + i,
          color: currentColor,
        })
      }

      setTrail((currentTrail) => {
        const combinedTrail = [...currentTrail, ...newPoints]
        return combinedTrail.length > MAX_TRAIL_POINTS
          ? combinedTrail.slice(combinedTrail.length - MAX_TRAIL_POINTS)
          : combinedTrail
      })

      setNextId(nextId + steps)
    }

    setLastPoint({ x, y })
  }

  const handleTouchStart = (event: any) => {
    const touch = event.nativeEvent
    setIsDrawing(true)
    setLastPoint({ x: touch.pageX, y: touch.pageY })

    setTrail((currentTrail) => {
      const newTrail = [
        ...currentTrail,
        {
          x: touch.pageX,
          y: touch.pageY,
          id: nextId,
          color: currentColor,
        },
      ]
      return newTrail.length > MAX_TRAIL_POINTS ? newTrail.slice(newTrail.length - MAX_TRAIL_POINTS) : newTrail
    })

    setNextId(nextId + 1)
  }

  const handleTouchMove = (event: any) => {
    const touch = event.nativeEvent
    addTrailPoint(touch.pageX, touch.pageY)
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    setTrail([])
    setNextId(0)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Background Image with Drawing Overlay */}
        <ImageBackground
          source={require("@/assets/images/back.png")}
          style={styles.drawingArea}
          resizeMode="cover"
        >
          {/* Touch Overlay for Drawing */}
          <View
            style={styles.touchOverlay}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {trail.map((point) => (
              <View
                key={point.id}
                style={[
                  styles.trailPoint,
                  {
                    left: point.x - 30,
                    top: point.y - 30,
                    backgroundColor: point.color + "4D",
                  },
                ]}
              />
            ))}
          </View>
        </ImageBackground>

        {/* Clear Button */}
        <Pressable style={styles.clearButton} onPress={clearCanvas}>
          <View style={styles.clearButtonInner} />
        </Pressable>

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
                },
              ]}
              onPress={() => setCurrentColor(color)}
            />
          ))}
        </View>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: "row",
  },
  drawingArea: {
    flex: 1,
    position: "relative",
  },
  touchOverlay: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  colorPicker: {
    width: 70,
    backgroundColor: "#e0e0e0",
    padding: 8,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  trailPoint: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderColor: "#fff",
  },
  clearButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  clearButtonInner: {
    width: 30,
    height: 4,
    backgroundColor: "#888",
    borderRadius: 2,
  },
})

