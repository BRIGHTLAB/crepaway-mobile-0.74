import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useGetOfferDetailsQuery } from '../api/offersApi';
import { DeliveryTakeawayStackParamList } from '../navigation/DeliveryTakeawayStack';
import { COLORS, SCREEN_PADDING } from '../theme';
import { normalizeFont } from '../utils/normalizeFonts';

type OfferDetailsScreenRouteProp = RouteProp<
  DeliveryTakeawayStackParamList,
  'OfferDetails'
>;

const OfferDetailsScreen = () => {
  const route = useRoute<OfferDetailsScreenRouteProp>();

  const { itemId } = route.params;

  const { data: offer, isLoading, error } = useGetOfferDetailsQuery(itemId);

  if (isLoading) {
    return (
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item flexDirection="column">
          <SkeletonPlaceholder.Item
            width="100%"
            height={380}
            borderRadius={8}
            marginBottom={16}
          />
          <SkeletonPlaceholder.Item
            width="60%"
            height={24}
            borderRadius={4}
            marginBottom={8}
            marginHorizontal={16}
          />
          <SkeletonPlaceholder.Item
            width="80%"
            height={16}
            borderRadius={4}
            marginBottom={8}
            marginHorizontal={16}
          />
          <SkeletonPlaceholder.Item
            width="90%"
            height={16}
            borderRadius={4}
            marginHorizontal={16}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: offer?.image_url }} style={styles.image} />
      <View style={{ paddingHorizontal: SCREEN_PADDING.horizontal }}>
        <Text style={styles.title}>{offer?.title}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 8,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: `${COLORS.secondaryColor}20`,
              flex: 1,
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: normalizeFont(12),
                color: COLORS.secondaryColor,
              }}>
              from{' '}
              {offer?.start_date
                ? new Date(offer.start_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })
                : ''}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: `${COLORS.secondaryColor}20`,
              flex: 1,
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: normalizeFont(12),
                color: COLORS.secondaryColor,
              }}>
              until{' '}
              {offer?.end_date
                ? new Date(offer.end_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })
                : ''}
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: normalizeFont(16),
            color: COLORS.foregroundColor,
            marginTop: 10,
          }}>
          {offer?.description}
        </Text>
      </View>
    </View>
  );
};

export default OfferDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 380,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    marginTop: 16,
    textTransform: 'uppercase',
    color: COLORS.darkColor,
  },
});
