import {FlatList, StyleSheet, Text, View} from 'react-native';
import OfferCard from '../components/Menu/OfferCard';
import React, {useEffect, useState} from 'react';
import {GET} from '../api';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useGetOffersQuery} from '../api/offersApi';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {DeliveryTakeawayStackParamList} from '../navigation/DeliveryTakeawayStack';

type OfferCardNavigationProp = NativeStackNavigationProp<
  DeliveryTakeawayStackParamList,
  'OfferDetails'
>;

const OffersScreen = () => {
  const {data, isLoading, error} = useGetOffersQuery({
    menu: 'mobile-app-delivery',
    branch: 'ashrafieh',
  });

  const navigation = useNavigation<OfferCardNavigationProp>();

  const renderItem = ({item}: {item: Offer}) => (
    <View style={styles.cardContainer}>
      <OfferCard
        id={item.id}
        image_url={item.image_url}
        style={{width: '100%'}}
        onItemPress={id => {
          navigation.navigate('OfferDetails', {itemId: id ?? 0});
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <SkeletonPlaceholder>
          <SkeletonPlaceholder.Item flexDirection="column">
            {[...Array(3)].map((_, index) => (
              <SkeletonPlaceholder.Item
                key={index}
                width={'100%'}
                borderRadius={8}
                marginBottom={16}
                marginHorizontal={12}>
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={156}
                  borderRadius={8}
                />
              </SkeletonPlaceholder.Item>
            ))}
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          numColumns={1}
          contentContainerStyle={{gap: 2}}
          // columnWrapperStyle={{
          //   gap: 16,
          // }}
          // ItemSeparatorComponent={() => <View style={{width: 16}} />}
        />
      )}
    </View>
  );
};

export default OffersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    margin: 8,
  },
});
