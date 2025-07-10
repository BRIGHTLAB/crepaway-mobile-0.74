import { FlatList, StyleSheet, Text, View } from 'react-native';
import OfferCard from '../components/Menu/OfferCard';
import React, { useEffect, useState } from 'react';
import { GET } from '../api';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useGetOffersQuery } from '../api/offersApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DineInOrderStackParamList } from '../navigation/DineInOrderStack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

type NavigationProp = NativeStackNavigationProp<DineInOrderStackParamList>;

const DineInOffersScreen = () => {
  const branch = useSelector((state: RootState) => state.user.branchName) || ''

  const { data, isLoading, error } = useGetOffersQuery({
    menu: 'mobile-app-delivery',
    branch,
  });

  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({ item }: { item: Offer }) => {
    return (
      <View style={styles.cardContainer}>
        <OfferCard
          id={item.id}
          image_url={item.image_url}
          style={{ width: '100%' }}
          onItemPress={(id: number) => {
            navigation.navigate('OffersStack', {
              screen: 'OfferDetails',
              params: { itemId: id ?? 0 },
            });
          }}
        />
      </View>
    );
  };

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
          contentContainerStyle={{ gap: 2 }}
        // columnWrapperStyle={{
        //   gap: 16,
        // }}
        // ItemSeparatorComponent={() => <View style={{width: 16}} />}
        />
      )}
    </View>
  );
};

export default DineInOffersScreen;

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
