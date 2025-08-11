import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { WebView } from 'react-native-webview';
import { useGetFAQQuery } from '../api/faqApi';
import { COLORS, SCREEN_PADDING } from '../theme';

const FAQScreen = () => {
  const { data: faq, isLoading, error } = useGetFAQQuery();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item flexDirection="column">
            <SkeletonPlaceholder.Item
              width="100%"
              height={40}
              borderRadius={4}
              marginBottom={16}
            />
            <SkeletonPlaceholder.Item
              width="100%"
              height={200}
              borderRadius={4}
              marginBottom={16}
            />
            <SkeletonPlaceholder.Item
              width="80%"
              height={40}
              borderRadius={4}
              marginBottom={16}
            />
            <SkeletonPlaceholder.Item
              width="100%"
              height={150}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Failed to load FAQ content. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{
          html: faq?.content || '<html><body><h1>No FAQ content available</h1></body></html>',
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
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.foregroundColor,
    textAlign: 'center',
    marginTop: 50,
  },
});
