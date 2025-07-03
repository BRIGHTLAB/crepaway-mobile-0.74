import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/NavigationStack';
import {normalizeFont} from '../utils/normalizeFonts';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useGetOfferDetailsQuery} from '../api/offersApi';
import {COLORS, SCREEN_PADDING} from '../theme';

type OfferDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'OfferDetails'
>;

const OfferDetailsScreen = () => {
  const route = useRoute<OfferDetailsScreenRouteProp>();

  const {itemId} = route.params;

  const {data: offer, isLoading, error} = useGetOfferDetailsQuery(itemId);

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
      <Image source={{uri: offer?.image_url}} style={styles.image} />
      <View style={{paddingHorizontal: SCREEN_PADDING.horizontal}}>
        <Text style={styles.title}>{offer?.title}</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: `${COLORS.secondaryColor}20`,
            width: 'auto',
            alignSelf: 'flex-start',
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: normalizeFont(14),
              color: COLORS.secondaryColor,
            }}>
            validty{' '}
            {offer?.expiry_date
              ? new Date(offer.expiry_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })
              : ''}
          </Text>
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
