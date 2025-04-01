"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, PanResponder, Dimensions, TouchableOpacity, Text } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useColorScheme } from "@/hooks/useColorScheme"
import Svg, { Polyline } from "react-native-svg"

// Define types for our drawing data
interface Point {
  x: number
  y: number
}

interface DrawPath {
  id: string
  path: Point[]
  color: string
  size: number
}

const COLORS = [
  "#FF5252", // Red
  "#FF9800", // Orange
  "#FFEB3B", // Yellow
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#673AB7", // Purple
  "#F06292", // Pink
  "#795548", // Brown
  "#607D8B", // Gray
  "#000000", // Black
  "#FFFFFF", // White
]

const { width, height } = Dimensions.get("window")

export default function ColoringGameScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [brushSize, setBrushSize] = useState(10)
  // Properly type the state variables
  const [paths, setPaths] = useState<DrawPath[]>([])
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Log when paths change
  useEffect(() => {
    console.log(`Paths updated. Count: ${paths.length}`)
  }, [paths])

  // Create the pan responder
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent
      setIsDrawing(true)
      setCurrentPath([{ x: locationX, y: locationY }])
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing) return
      const { locationX, locationY } = evt.nativeEvent
      setCurrentPath((prevPath) => [...prevPath, { x: locationX, y: locationY }])
    },
    onPanResponderRelease: () => {
      if (currentPath.length > 0) {
        // Important: Use functional update to ensure we're working with the latest state
        setPaths((prevPaths) => [
          ...prevPaths,
          {
            id: Date.now().toString(), // Add unique ID
            path: currentPath,
            color: selectedColor,
            size: brushSize,
          },
        ])
        setCurrentPath([])
        setIsDrawing(false)
      }
    },
  })

  // Clear canvas
  const clearCanvas = () => {
    setPaths([])
  }

  // Change brush size
  const changeBrushSize = (size: number) => {
    setBrushSize(size)
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Coloring Game</ThemedText>
        <View style={styles.headerButtons}>
          <Text style={styles.debugText}>{paths.length} paths</Text>
        </View>
      </ThemedView>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        {/* Background Image */}
        <View style={styles.backgroundImageContainer} pointerEvents="none">
          <IconSymbol
            size={width * 0.8}
            color={colorScheme === "dark" ? "#353636" : "#D0D0D0"}
            name="chevron.left.forwardslash.chevron.right"
          />
        </View>

        {/* Saved Paths Layer */}
        <View style={styles.pathsLayer} pointerEvents="none">
          {paths.map((item) => (
            <View key={item.id} style={styles.pathContainer}>
              <Svg height="100%" width="100%">
                <Polyline
                  points={item.path.map((point) => `${point.x},${point.y}`).join(" ")}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={item.size}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          ))}
        </View>

        {/* Current Drawing Path Layer */}
        {currentPath.length > 0 && (
          <View style={styles.pathContainer} pointerEvents="none">
            <Svg height="100%" width="100%">
              <Polyline
                points={currentPath.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke={selectedColor}
                strokeWidth={brushSize}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        )}
      </View>

      {/* Fixed Color Palette at Bottom */}
      <View style={styles.colorPalette}>
        <View style={styles.colorRow}>
          {/* Color circles */}
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: color }, selectedColor === color && styles.selectedColor]}
              onPress={() => setSelectedColor(color)}
            />
          ))}

          {/* Clear button as the last circle */}
          <TouchableOpacity style={[styles.colorButton, styles.clearButton]} onPress={clearCanvas}>
            <IconSymbol size={20} color={colorScheme === "dark" ? "#FFFFFF" : "#000000"} name="trash" />
          </TouchableOpacity>
        </View>

        {/* Brush size selector */}
        <View style={styles.brushSizes}>
          {[5, 10, 15, 20].map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.brushButton, brushSize === size && styles.selectedBrush]}
              onPress={() => changeBrushSize(size)}
            >
              <View
                style={[
                  styles.brushPreview,
                  {
                    width: size,
                    height: size,
                    backgroundColor: selectedColor,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  debugText: {
    fontSize: 12,
    opacity: 0.5,
  },
  canvasContainer: {
    flex: 1,
    position: "relative",
  },
  backgroundImageContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -width * 0.4 }, { translateY: -width * 0.4 }],
  },
  pathsLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  pathContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  colorPalette: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 100,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    margin: 4,
  },
  clearButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedColor: {
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.2 }],
  },
  brushSizes: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  brushButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedBrush: {
    borderColor: "#FFFFFF",
  },
  brushPreview: {
    borderRadius: 50,
  },
})

