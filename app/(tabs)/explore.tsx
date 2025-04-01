"use client"

import { useState, useRef } from "react"
import { StyleSheet, View, PanResponder, Animated, Dimensions, TouchableOpacity } from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useColorScheme } from "@/hooks/useColorScheme"
import Svg, { Polyline } from "react-native-svg"

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
  const [paths, setPaths] = useState<Array<{ path: Array<{ x: number; y: number }>; color: string; size: number }>>([])
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([])

  // Reference to the canvas view for measurements
  const canvasRef = useRef<View>(null)
  const [canvasLayout, setCanvasLayout] = useState({ x: 0, y: 0, width: 0, height: 0 })

  // Animation value for color palette
  const paletteAnimation = useRef(new Animated.Value(0)).current
  const [isPaletteVisible, setIsPaletteVisible] = useState(false)

  // Set up pan responder for drawing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent
        setCurrentPath([{ x: locationX, y: locationY }])
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent
        setCurrentPath((prevPath) => [...prevPath, { x: locationX, y: locationY }])
      },
      onPanResponderRelease: () => {
        if (currentPath.length > 0) {
          setPaths((prevPaths) => [...prevPaths, { path: currentPath, color: selectedColor, size: brushSize }])
          setCurrentPath([])
        }
      },
    }),
  ).current

  // Toggle color palette
  const togglePalette = () => {
    if (isPaletteVisible) {
      Animated.timing(paletteAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsPaletteVisible(false))
    } else {
      setIsPaletteVisible(true)
      Animated.timing(paletteAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  // Clear canvas
  const clearCanvas = () => {
    setPaths([])
  }

  // Change brush size
  const changeBrushSize = (size: number) => {
    setBrushSize(size)
  }

  // Render paths on canvas
  const renderPaths = () => {
    return paths.map((item, index) => {
      const points = item.path.map((point) => `${point.x},${point.y}`).join(" ")
      return (
        <View key={index} style={styles.pathContainer}>
          <Svg height="100%" width="100%" style={styles.svg}>
            <Polyline
              points={points}
              fill="none"
              stroke={item.color}
              strokeWidth={item.size}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )
    })
  }

  // Render current path while drawing
  const renderCurrentPath = () => {
    if (currentPath.length === 0) return null

    const points = currentPath.map((point) => `${point.x},${point.y}`).join(" ")
    return (
      <View style={styles.pathContainer}>
        <Svg height="100%" width="100%" style={styles.svg}>
          <Polyline
            points={points}
            fill="none"
            stroke={selectedColor}
            strokeWidth={brushSize}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    )
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Coloring Game</ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={togglePalette} style={styles.iconButton}>
            <IconSymbol size={24} color={selectedColor} name="paintpalette" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearCanvas} style={styles.iconButton}>
            <IconSymbol size={24} color={colorScheme === "dark" ? "#FFFFFF" : "#000000"} name="trash" />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <View
        style={styles.canvasContainer}
        ref={canvasRef}
        onLayout={(event) => {
          if (canvasRef.current) {
            canvasRef.current.measure((x, y, width, height, pageX, pageY) => {
              setCanvasLayout({ x: pageX, y: pageY, width, height })
            })
          }
        }}
        {...panResponder.panHandlers}
      >
        <IconSymbol
          size={width * 0.8}
          color={colorScheme === "dark" ? "#353636" : "#D0D0D0"}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.backgroundImage}
        />
        {renderPaths()}
        {renderCurrentPath()}
      </View>

      {isPaletteVisible && (
        <Animated.View
          style={[
            styles.colorPalette,
            {
              transform: [
                {
                  translateY: paletteAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.colorRow}>
            {COLORS.slice(0, 6).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
          <View style={styles.colorRow}>
            {COLORS.slice(6).map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
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
        </Animated.View>
      )}
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
  },
  iconButton: {
    padding: 8,
  },
  canvasContainer: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -width * 0.4,
    marginTop: -width * 0.4,
  },
  pathContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    backgroundColor: "transparent",
  },
  colorPalette: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
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

