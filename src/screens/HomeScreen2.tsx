import React from "react";
import {
  View,
  Text,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const BANNER_HEIGHT = 200;

// Wrap SectionList with Animated
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

// Define navigation params
type RootStackParamList = {
  Parallax: undefined;
};

type Item = string;
type Section = { title: string; data: Item[] };

export default function ParallaxScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Parallax banner animation
  const animatedBannerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
      [2, 1, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [-BANNER_HEIGHT, 0, BANNER_HEIGHT],
      [-BANNER_HEIGHT / 2, 0, BANNER_HEIGHT * 0.5],
      Extrapolation.CLAMP
    );

    return { transform: [{ scale }, { translateY }] };
  });

  // Header fade-in animation
  const animatedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, BANNER_HEIGHT / 2],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const renderHeader = () => null;

  const DATA: Section[] = [
    { title: "Section 1", data: ["Item 1", "Item 2", "Item 3"] },
    { title: "Section 2", data: ["Item 4", "Item 5"] },
    { title: "Section 2", data: ["Item 4", "Item 5"] },
    { title: "Section 2", data: ["Item 4", "Item 5"] },
    { title: "Section 2", data: ["Item 4", "Item 5"] },
  ];

  const renderItem: SectionListRenderItem<Item, Section> = ({ item }) => (
    <View style={styles.item}>
      <Text>{item}</Text>
    </View>
  );

  return (
  <View style={{ flex: 1 }}>
    {/* Transparent nav header */}
    <Animated.View style={[styles.navHeader, animatedHeaderStyle]}>
      <Text style={styles.navTitle}>Parallax</Text>
    </Animated.View>

    {/* Banner absolutely positioned */}
    <Animated.Image
      source={{ uri: "https://picsum.photos/800/400" }}
      style={[styles.banner, animatedBannerStyle, { position: "absolute", top: 0, left: 0 }]}
      resizeMode="cover"
    />

    {/* Content list */}
    <AnimatedSectionList
      sections={DATA}
      keyExtractor={(item, index) => item + index}
      renderItem={renderItem}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
      // Instead of ListHeaderComponent, give padding
      contentContainerStyle={{ paddingTop: BANNER_HEIGHT }}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  </View>
);

}

const styles = StyleSheet.create({
  banner: {
    width: width,
    height: BANNER_HEIGHT,
  },
  item: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  navHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
