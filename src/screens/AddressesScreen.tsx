import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import DeleteAnimation from '../../assets/lotties/Delete.json';
import Icon_Delete from '../../assets/SVG/Icon_Delete';
import Icon_Location from '../../assets/SVG/Icon_Location';
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
} from '../api/addressesApi';
import AddAddressButton from '../components/Address/AddAddressButton';
import ConfirmationPopup from '../components/Popups/ConfirmationPopup';
import { ServiceSelectionStackParamList } from '../navigation/ServiceSelectionStack';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';
import { useDispatch } from 'react-redux';
import {
  setAddress,
  setBranchName,
  setOrderType,
} from '../store/slices/userSlice';

type NavigationProp = NativeStackNavigationProp<ServiceSelectionStackParamList>;

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
const AddressScreen = () => {
  // State for confirmation modal
  const [confirmModal, setConfirmModal] =
    useState<ModalState>(initialModalState);

  const [deleteAddress, { isLoading: deleteAddressLoading, error }] =
    useDeleteAddressMutation();

  const navigation = useNavigation<NavigationProp>();
  const { data, isLoading } = useGetAddressesQuery();
  const dispatch = useDispatch();

  const handleConfirmDelete = async (id: number | null) => {
    if (!id) return;
    try {
      await deleteAddress({ id }).unwrap();
      setConfirmModal(initialModalState);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };
  const handleSelectAddress = (address: Address) => {
    dispatch(
      setAddress({
        id: address.id,
        latitude: address.latitude,
        longitude: address.longitude,
        title: address.title,
      }),
    );
    dispatch(setBranchName('delivery')),
      dispatch(
        setOrderType({
          menuType: 'delivery',
          orderTypeAlias: 'delivery',
        }),
      );
  };

  const renderAddressItem = (item: Address) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleSelectAddress(item)}>
        <View style={styles.itemHeader}>
          <Icon_Location color={COLORS.black} />
          <Text style={[styles.itemName]}>{item.title}</Text>
          <TouchableOpacity
            style={{ marginLeft: 'auto', paddingBottom: 5, paddingLeft: 10 }}
            onPress={() =>
              setConfirmModal({
                id: item.id,
                visible: true,
                addressTitle: item.title,
              })
            }>
            <Icon_Delete />
          </TouchableOpacity>
        </View>
        <Text style={[styles.itemDescription]}>
          {item.city} | {item.building} {item.floor} | {item.additional_info}
        </Text>
      </TouchableOpacity>
    );
  };

  // Defensive navigation handler
  const handleAddAddressPress = () => {
    console.log('asdadsadsadsa')
    if (!navigation || typeof navigation.navigate !== 'function') {
      console.warn('Navigation object is missing or invalid in AddressesScreen');
      return;
    }
    navigation.navigate('AddressMap');
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
        />
      )}
      <AddAddressButton onPress={handleAddAddressPress} />
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

const AddressSkeleton = () => {
  return (
    <View>
      <View style={styles.listContainer}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={styles.itemContainer}>
            <SkeletonPlaceholder>
              <>
                <View style={styles.itemHeader}>
                  {/* Location icon placeholder */}
                  <View style={{ width: 20, height: 20, borderRadius: 10 }} />
                  {/* Title placeholder */}
                  <View
                    style={{
                      marginLeft: 16,
                      width: 100,
                      height: 20,
                      borderRadius: 4,
                    }}
                  />
                  {/* Delete icon placeholder */}
                  <View style={{ marginLeft: 'auto' }}>
                    <View style={{ width: 20, height: 20, borderRadius: 10 }} />
                  </View>
                </View>
                {/* Address description placeholder */}
                <View
                  style={{
                    width: '80%',
                    height: 15,
                    borderRadius: 4,
                    marginTop: 8,
                  }}
                />
              </>
            </SkeletonPlaceholder>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
    gap: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  listContainer: {
    gap: 12,
  },
  itemContainer: {
    gap: 4,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  itemName: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.black,
    flex: 1,
  },
  itemDescription: {
    ...TYPOGRAPHY.TAGS,
    color: COLORS.black,
  },
});
