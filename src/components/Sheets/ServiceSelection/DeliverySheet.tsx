import BottomSheet, {
  BottomSheetView
} from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, {
  forwardRef
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Icon_Location from '../../../../assets/SVG/Icon_Location';
import { ServiceSelectionStackParamList } from '../../../navigation/ServiceSelectionStack';
import { setBranchName, setOrderType } from '../../../store/slices/userSlice';
import { RootState } from '../../../store/store';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import AddAddressButton from '../../Address/AddAddressButton';
import Button from '../../UI/Button';
import SelectButton from '../../UI/SelectButton';
import DynamicSheet from '../DynamicSheet';

type Props = {};
type NavigationProp = NativeStackNavigationProp<ServiceSelectionStackParamList>;

const DeliverySheet = forwardRef<BottomSheet, Props>(({ }, ref) => {
  const navigation = useNavigation<NavigationProp>();
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const { bottom } = useSafeAreaInsets();

  const handleSelectAddress = () => {
    navigation.navigate('Addresses');
  };

  const handleProceedPress = () => {
    console.log('proceed');
    // Clear branch when selecting delivery
    dispatch(setBranchName({ name: null, alias: null }));
    dispatch(
      setOrderType({
        menuType: 'delivery',
        orderTypeAlias: 'delivery',
      }),
    );
  };

  return (
    <DynamicSheet ref={ref}>
      <BottomSheetView
        style={{
          gap: 16,
          paddingBottom: bottom + 10,
        }}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Delivery</Text>
          <Text style={styles.description}>
            Get ready! Please select an address or add a new one to proceed
          </Text>
        </View>
        <SelectButton
          iconLeft={<Icon_Location />}
          title={
            userState.addressTitle ? userState.addressTitle : 'Select Address'
          }
          onPress={handleSelectAddress}
        />
        <AddAddressButton
          onPress={() => {
            // if (!navigation || typeof navigation.navigate !== 'function') {
            //   console.warn('Navigation object is missing or invalid in AddressesScreen');
            //   return;
            // }
            navigation.navigate('AddressMap');
          }}
        />
        <Button onPress={handleProceedPress} disabled={!userState.addressId}>
          Proceed
        </Button>
      </BottomSheetView>
    </DynamicSheet>
  );
});

export default DeliverySheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.black,
  },
  description: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: '#8391A1',
  },
});
