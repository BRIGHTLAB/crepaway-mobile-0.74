import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { WebView } from 'react-native-webview';
import { useGetLegalContentQuery } from '../api/legalsApi';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

const FAQScreen = () => {
  const { data: faq, isLoading, error } = useGetLegalContentQuery('faq');

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
      {faq?.title && (
        <Text style={styles.title}>{faq.title}</Text>
      )}
      {faq?.description && (
        <Text style={styles.description}>{faq.description}</Text>
      )}
      <WebView
        style={styles.webView}
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
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.darkColor,
    marginBottom: 8,
  },
  description: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
    marginBottom: 16,
  },
  webView: {
    flex: 1,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.foregroundColor,
    textAlign: 'center',
    marginTop: 50,
  },
});
