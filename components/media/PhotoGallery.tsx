import { XIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Video, ResizeMode } from "expo-av";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface PhotoGalleryProps {
  visible: boolean;
  images: any[];
  initialIndex?: number;
  onClose: () => void;
}

export default function PhotoGallery({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * SCREEN_WIDTH,
          animated: false,
        });
        setCurrentIndex(initialIndex);
      }, 100);
    }
  }, [visible, initialIndex]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const isVideo = (image: any) => {
    if (typeof image === "object" && image.uri) {
      const uri = image.uri.toLowerCase();
      return (
        uri.endsWith(".mp4") ||
        uri.endsWith(".mov") ||
        uri.endsWith(".avi") ||
        uri.endsWith(".mkv") ||
        uri.endsWith(".webm")
      );
    }
    return false;
  };

  if (!visible || images.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black" style={{ position: "relative" }}>
        {/* Image Gallery - Full Screen */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ width: SCREEN_WIDTH * images.length }}
        >
          {images.map((image, index) => (
            <View
              key={index}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
              className="items-center justify-center"
            >
              {isVideo(image) ? (
                <Video
                  source={image}
                  style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                  }}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay={index === currentIndex}
                  isLooping
                />
              ) : (
                <Image
                  source={image}
                  style={{
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT,
                  }}
                  resizeMode="contain"
                />
              )}
            </View>
          ))}
        </ScrollView>

        {/* Overlay Layer - Fixed Position */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "box-none",
          }}
        >
          {/* Top Header Bar */}
          <View
            style={{
              position: "absolute",
              top: Math.max(insets.top, 20) + 10, // Safe area + margin
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              zIndex: 50,
              pointerEvents: "box-none",
            }}
          >
            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                alignItems: "center",
                justifyContent: "center",
                elevation: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <XIcon size={24} color="white" weight="bold" />
            </Pressable>

            {/* Photo Counter */}
            <View
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                pointerEvents: "none",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "600",
                  fontFamily: "Urbanist",
                }}
              >
                {currentIndex + 1} / {images.length}
              </Text>
            </View>

            {/* Spacer */}
            <View style={{ width: 48 }} />
          </View>

          {/* Bottom Dots Indicator */}
          {images.length > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: 32,
                left: 0,
                right: 0,
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                pointerEvents: "none",
              }}
            >
              {images.map((_, index) => (
                <View
                  key={index}
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === currentIndex
                        ? "white"
                        : "rgba(255, 255, 255, 0.5)",
                    width: index === currentIndex ? 24 : 8,
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

