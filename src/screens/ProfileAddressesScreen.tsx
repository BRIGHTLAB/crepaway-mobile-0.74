import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import DeleteAnimation from '../../assets/lotties/Delete.json';
import Icon_Delete from '../../assets/SVG/Icon_Delete';
import Icon_Edit from '../../assets/SVG/Icon_Edit';
import Icon_Location from '../../assets/SVG/Icon_Location';
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
} from '../api/addressesApi';
import AddAddressButton from '../components/Address/AddAddressButton';
import ConfirmationPopup from '../components/Popups/ConfirmationPopup';
import { ProfileStackParamList } from '../navigation/DeliveryTakeawayStack';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

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
  const { data, isLoading } = useGetAddressesQuery();

  const handleConfirmDelete = async (id: number | null) => {
    if (!id) return;
    try {
      await deleteAddress({ id }).unwrap();
      setConfirmModal(initialModalState);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleEditAddress = (address: Address) => {
    navigation.navigate('AddressMap', { editAddress: address });
  };

  const renderAddressItem = (item: Address) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Icon_Location color={COLORS.black} />
          <Text style={[styles.itemName]}>{item.title}</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => handleEditAddress(item)}>
              <Icon_Edit color={COLORS.black} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
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
        </View>
        <Text style={[styles.itemDescription]}>
          {item.building} {item.floor} {item.additional_info ? `| ${item.additional_info}` : ''}
        </Text>
      </View>
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

export default ProfileAddressesScreen;

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
  iconButton: {
    paddingBottom: 5,
    paddingLeft: 10,
  },
  itemDescription: {
    ...TYPOGRAPHY.TAGS,
    color: COLORS.black,
  },
});
