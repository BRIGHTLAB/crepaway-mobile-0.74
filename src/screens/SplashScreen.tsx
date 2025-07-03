import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';

const SplashScreen = ({onAnimationFinish}: {onAnimationFinish: () => void}) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/lotties/Logo_Intro.json')}
        style={{width: 164, height: 150}}
        onAnimationFinish={() => {
          console.log('finished');
          onAnimationFinish();
        }}
        autoPlay
        loop={false}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
