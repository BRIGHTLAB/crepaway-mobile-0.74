import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS, SCREEN_PADDING} from '../theme';
import {WebView} from 'react-native-webview';

const FAQScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{
          html: '<html><body><h1>Test Legal Screen</h1><p>This is a test page.</p></body></html>',
        }}
      />
    </View>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
  },
});
