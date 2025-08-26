import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { WebView } from 'react-native-webview';
import { useGetLegalContentQuery } from '../api/legalsApi';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

const LegalScreen = () => {
  const { data: legal, isLoading, error } = useGetLegalContentQuery('legals');

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
          Failed to load legal content. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {legal?.title && (
        <Text style={styles.title}>{legal.title}</Text>
      )}
      {legal?.description && (
        <Text style={styles.description}>{legal.description}</Text>
      )}
      <WebView
        style={styles.webView}
        source={{
          html: legal?.content || '<html><body><h1>No legal content available</h1></body></html>',
        }}
      />
    </View>
  );
};

export default LegalScreen;

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
