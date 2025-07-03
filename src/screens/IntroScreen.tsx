import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  Easing,
  Image,
} from 'react-native';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import { normalizeFont } from '../utils/normalizeFonts';
import Icon_Arrow_Right from '../../assets/SVG/Icon_Arrow_Right';
import { TYPOGRAPHY } from '../constants/typography';
import Button from '../components/UI/Button';
import { COLORS } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const { width } = Dimensions.get('window');

interface SlideItem {
  title: string;
  description: string;
}

const IntroScreen = ({ navigation }: IProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;
  const currentIndexRef = useRef(currentIndex);
  const isAnimating = useRef(false);
  const rotate = useRef(new Animated.Value(0)).current;

  const { bottom, top } = useSafeAreaInsets();

  const data: SlideItem[] = [
    {
      title: 'Effortless Dining Delight',
      description:
        'Indulge in a seamless dining experience, from ordering to paying',
    },
    {
      title: 'Takeaway Fiesta',
      description:
        'Celebrate every bite with our quick and lively takeaway deliveries at your fingertips!',
    },
    {
      title: 'Instant Food Joy',
      description:
        'Savor joy in every bite with swift and customizable food deliveries at your fingertips.',
    },
    {
      title: 'Rewards Hub',
      description:
        'Kick off excitement and earn loyalty points with every purchase, unlocking exclusive rewards.',
    },
  ];

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (currentIndex === data.length - 1) {
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      buttonSlideAnim.setValue(100);
    }
  }, [currentIndex]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        if (isAnimating.current) return;

        const { dx } = gestureState;
        if (Math.abs(dx) > 50) {
          const direction = dx > 0 ? -1 : 1;
          const newIndex = currentIndexRef.current + direction;

          if (newIndex >= 0 && newIndex < data.length) {
            handleSlideChange(newIndex);
          }
        }
      },
    }),
  ).current;

  const handleSlideChange = (newIndex: number) => {
    isAnimating.current = true;

    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 20,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(newIndex);

      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 20,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    });
  };

  const renderImage = (top?: boolean) => {
    switch (currentIndex) {
      case 0:
        return top
          ? require('../../assets/images/intro/Image1.png')
          : require('../../assets/images/intro/Image1_Lower.png');
      case 1:
        return top
          ? require('../../assets/images/intro/Image3.png')
          : require('../../assets/images/intro/Image3_Lower.png');
      case 2:
        return top
          ? require('../../assets/images/intro/Image4.png')
          : require('../../assets/images/intro/Image4_Lower.png');
      default:
        return top
          ? require('../../assets/images/intro/Image2.png')
          : require('../../assets/images/intro/Image2_Lower.png');
    }
  };

  const renderSlide = () => (
    <Animated.View
      style={[styles.slide, { width }]}
      {...panResponder.panHandlers}>
      <Animated.View
        style={{
          height: normalizeFont(340),
          width: normalizeFont(276),
          position: 'relative',
          alignSelf: 'center',
          opacity: imageOpacity,
        }}>
        <Image
          source={renderImage(true)}
          style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            zIndex: 1,
          }}
        />

        <Image
          source={renderImage()}
          style={{
            height: '100%',
            width: '100%',
            position: 'absolute',
          }}
        />

        <View
          style={{
            height: normalizeFont(340),
            width: normalizeFont(276),
            justifyContent: 'flex-end',
          }}>
          <Animated.View style={[{ transform: [{ rotate: rotation }] }]}>
            <Icon_Spine />
          </Animated.View>
        </View>
      </Animated.View>
      <Animated.View style={[styles.infoContent, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{data[currentIndex].title}</Text>
        <Text style={styles.description}>{data[currentIndex].description}</Text>
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: top, paddingBottom: bottom }]}>
      {/* Header with Skip button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.skipContainer}
          onPress={() => navigation.navigate('Login')}>
          <Text style={[{ color: 'white' }, TYPOGRAPHY.SUB_HEADLINE]}>Skip</Text>
          <Icon_Arrow_Right />
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={styles.contentContainer}>
        {renderSlide()}
      </View>

      {/* Bottom section with pagination and button */}
      <View style={styles.bottomSection}>
        <View style={styles.pagination}>
          {data.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.dot, currentIndex === idx && styles.activeDot]}
              onPress={() => handleSlideChange(idx)}
            />
          ))}
        </View>

        {currentIndex === data.length - 1 && (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ translateY: buttonSlideAnim }],
              }
            ]}>
            <Button
              variant="secondary"
              style={{ width: '100%' }}
              onPress={() => navigation.navigate('Login')}>
              Proceed
            </Button>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryColor,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    padding: 16,
    gap: 30,
    alignItems: 'center',
  },
  infoContent: {
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    color: COLORS.lightColor,
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'center',
  },
  description: {
    color: COLORS.lightColor,
    fontFamily: 'Poppins-Normal',
    fontSize: 20,
    lineHeight: 28,
    opacity: 0.8,
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 20,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    margin: 5,
    backgroundColor: 'rgba(247,247,247,0.5)',
  },
  activeDot: {
    width: 36,
    backgroundColor: COLORS.lightColor,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default IntroScreen;