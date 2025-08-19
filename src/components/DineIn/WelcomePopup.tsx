import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { useGetOffersQuery } from '../../api/offersApi';
import { DineInStackParamList } from '../../navigation/DineInStack';
import { TableWaiter } from '../../screens/TableScreen';
import { RootState } from '../../store/store';
import { COLORS, TYPOGRAPHY } from '../../theme';
import OfferCard from '../Menu/OfferCard';
import Button from '../UI/Button';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MODAL_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_WIDTH = Math.min(220, MODAL_WIDTH - 60); // Ensure cards fit within modal with padding

type Offer = {
  id: number;
  image_url: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onViewMenu: () => void;
  waiter?: TableWaiter;
};

type NavigationProp = NativeStackNavigationProp<DineInStackParamList>;

const WelcomePopup = ({ visible, onClose, onViewMenu, waiter }: Props) => {
  const userState = useSelector((state: RootState) => state.user);
  const {
    data: offers,
    isLoading,
    error,
  } = useGetOffersQuery({
    menuType: userState.menuType,
    branch: userState.branchTable?.split('.')?.[0] || null,
  });

  const navigation = useNavigation<NavigationProp>();

  const handleOfferPress = (id: number) => {
    navigation.navigate('OrderStack', {
      screen: 'OffersStack',
      params: {
        screen: 'OfferDetails',
        params: { itemId: id },
      },
    });
  };

  const renderOfferItem = ({ item }: { item: Offer }) => (
    <OfferCard
      id={item.id}
      image_url={item.image_url}
      style={{ width: CARD_WIDTH, marginRight: 15 }}
      onItemPress={handleOfferPress}
    />
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>Welcome to the table!</Text>
              {waiter?.name && (
                <Text style={styles.waiterInfo}>
                  Meet {waiter?.name}, your server for today's dining
                  experience!
                </Text>
              )}
            </View>
          </View>

          <Text style={styles.offersTitle}>Today's Special Offers</Text>

          <View style={styles.offersContainer}>
            {isLoading ? (
              <View style={styles.skeletonsContainer}>
                <OfferSkeleton style={{ width: CARD_WIDTH }} />
                <OfferSkeleton style={{ width: CARD_WIDTH }} />
              </View>
            ) : (
              <FlatList
                data={offers}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                renderItem={renderOfferItem}
                contentContainerStyle={styles.offersList}
                ListEmptyComponent={
                  <Text style={styles.noOffersText}>
                    No special offers available at the moment
                  </Text>
                }
              />
            )}
          </View>

          <View style={styles.popupButtonsContainer}>
            <Button variant="outline" style={{ flex: 1 }} onPress={onClose}>
              Thank you!
            </Button>
            <Button style={{ flex: 1 }} onPress={onViewMenu}>
              Order Now
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const OfferSkeleton = ({ style }: { style?: object }) => {
  return (
    <View style={[styles.skeletonContainer, style]}>
      <View style={styles.shimmer} />
    </View>
  );
};

export default WelcomePopup;

const styles = StyleSheet.create({
  skeletonContainer: {
    height: 156,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: COLORS.accentColor || '#F0F0F0',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
  skeletonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 10,
    width: '100%',
  },
  offersContainer: {
    width: '100%',
    overflow: 'hidden',
    minHeight: 156, // Match the height of a skeleton/card
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 28,
    color: COLORS.secondaryColor,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  waiterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
    marginBottom: 10,
  },
  waiterInfo: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
  },
  offersTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
    marginBottom: 15,
  },
  offersList: {
    paddingVertical: 10,
  },
  noOffersText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.black,
    textAlign: 'center',
    marginVertical: 20,
  },
  popupButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
});
