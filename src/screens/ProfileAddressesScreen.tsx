import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DeleteAnimation from '../../assets/lotties/Delete.json';
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
} from '../api/addressesApi';
import AddAddressButton from '../components/Address/AddAddressButton';
import AddressItem from '../components/Address/AddressItem';
import AddressSkeleton from '../components/Address/AddressSkeleton';
import ConfirmationPopup from '../components/Popups/ConfirmationPopup';
import { ProfileStackParamList } from '../navigation/DeliveryTakeawayStack';
import { setAddress } from '../store/slices/userSlice';
import { RootState } from '../store/store';
import { COLORS, SCREEN_PADDING } from '../theme';
import { usePullToRefresh } from '../hooks/usePullToRefresh';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

type ModalState = {
  id: number | null;
  visible: boolean;
  addressTitle: string;
};

const initialModalState = {
  id: null,
  visible: false,
  addressTitle: '',
};
const ProfileAddressesScreen = () => {
  // State for confirmation modal
  const [confirmModal, setConfirmModal] =
    useState<ModalState>(initialModalState);

  const [deleteAddress, { isLoading: deleteAddressLoading, error }] =
    useDeleteAddressMutation();

  const navigation = useNavigation<NavigationProp>();
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useGetAddressesQuery();
  const dispatch = useDispatch();
  const selectedAddressId = useSelector(
    (state: RootState) => state.user.addressId,
  );

  const { refreshing, onRefresh } = usePullToRefresh({
    refetch,
    isFetching,
    isLoading,
  });

  const handleConfirmDelete = async (id: number | null) => {
    if (!id) return;
    try {
      await deleteAddress({ id }).unwrap();

      if (id === selectedAddressId) {
        const remaining = (data ?? []).filter(addr => addr.id !== id);
        const lastAddress = remaining[remaining.length - 1];
        if (lastAddress) {
          dispatch(
            setAddress({
              id: lastAddress.id,
              title: lastAddress.title,
              latitude: lastAddress.latitude,
              longitude: lastAddress.longitude,
            }),
          );
        } else {
          dispatch(
            setAddress({
              id: null,
              title: null,
              latitude: null,
              longitude: null,
            }),
          );
        }
      }

      setConfirmModal(initialModalState);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleEditAddress = (address: Address) => {
    navigation.navigate('AddressMap', { editAddress: address });
  };

  const handleDeleteAddress = (address: Address) => {
    setConfirmModal({
      id: address.id,
      visible: true,
      addressTitle: address.title,
    });
  };

  const renderAddressItem = (item: Address) => {
    const isSelected = item.id === selectedAddressId;
    return (
      <AddressItem
        address={item}
        isSelected={isSelected}
        onEdit={handleEditAddress}
        onDelete={handleDeleteAddress}
      />
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <AddressSkeleton />
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => renderAddressItem(item)}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primaryColor}
              colors={[COLORS.primaryColor]}
            />
          }
        />
      )}
      <AddAddressButton onPress={() => navigation.navigate('AddressMap')} />
      <ConfirmationPopup
        visible={confirmModal.visible}
        title="Delete Address"
        lottieSrc={DeleteAnimation}
        onClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
        onConfirm={() => handleConfirmDelete(confirmModal.id)}
        message={`Are you sure you want to delete ${confirmModal.addressTitle} ?`}
        btnLoading={deleteAddressLoading}
      />
    </View>
  );
};

export default ProfileAddressesScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
    gap: 10,
    justifyContent: 'space-between',
    flex: 1,
    backgroundColor: COLORS.lightColor,
  },
  listContainer: {
    gap: 12,
    paddingBottom: 20,
  },
});
