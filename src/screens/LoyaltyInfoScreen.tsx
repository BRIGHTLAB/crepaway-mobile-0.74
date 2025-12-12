import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, SCREEN_PADDING } from '../theme';

const fakeData = [
  {
    content: '<h1>Welcome to our Loyalty Program!</h1><p>Join our loyalty program and start earning points with every purchase. Redeem your points for exciting rewards and exclusive offers. Read on to learn more about how our program works and how you can maximize your benefits.</p>',
  },
  {
    content: '<h2 style="color: green;">How it works</h2><h3><strong>Tier Validity & Review</strong></h3><p>Your tier status is reviewed every 90 days based on your recent activity. To maintain your current tier, you must meet the minimum requirements during this period. If you don\'t meet the requirements, your tier may be downgraded.</p><p style="margin-left: 20px; color: #666;">Example: If you are in Gold tier and don\'t meet the requirements, you may be downgraded to Silver tier.</p>',
  },
  {
    content: '<h2>Earning points</h2><h3><strong>Minimum Order Value</strong></h3><p>To qualify for points, your average order value must meet the minimum threshold. Points are calculated based on your total purchase amount after discounts and promotions.</p>',
  },
  {
    content: '<h2>Redeeming Points</h2><p>You can redeem your accumulated points for various rewards including discounts, free items, and exclusive offers. The redemption options are updated regularly, so check back often for new opportunities.</p>',
  },
  {
    content: '<h2>Program Benefits</h2><ul><li>Earn points on every purchase</li><li>Exclusive member-only offers</li><li>Birthday rewards</li><li>Early access to new products</li><li>Special tier benefits</li></ul>',
  },
];

const LoyaltyInfoScreen = () => {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {fakeData.map((item, index) => (
        <View key={index} style={styles.card}>
          <WebView
            style={styles.webView}
            source={{
              html: item.content || '<html><body><p>No content available</p></body></html>',
            }}
            scrollEnabled={false}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default LoyaltyInfoScreen;

const HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
    backgroundColor: COLORS.secondaryColor,
    minHeight: HEIGHT,
    gap: 24,
  },
  card: {
    backgroundColor: '#F4F4F4',
    padding: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  webView: {
    minHeight: 100,
    backgroundColor: 'transparent',
  },
});
