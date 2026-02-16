import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import Icon_Add from '../../../assets/SVG/Icon_Add';
import Icon_Edit from '../../../assets/SVG/Icon_Edit';
import { useAddAddressesMutation, useUpdateAddressMutation } from '../../api/addressesApi';
import { Zone } from '../../api/dataApi';
import { ServiceSelectionStackParamList } from '../../navigation/ServiceSelectionStack';
import { setAddress, setBranchName, setOrderType } from '../../store/slices/userSlice';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import BottomSheetInput from '../UI/BottomSheetInput';
import Button from '../UI/Button';
import DynamicSheet from './DynamicSheet';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  coordinates: Coordinates;
  editAddress?: Address | null;
  selectedZone: Zone | null;
  zones: Zone[];
  isPointInPolygon: (
    point: { latitude: number; longitude: number },
    polygon: Zone['boundary'],
  ) => boolean;
};

type AddressForm = z.infer<typeof addressSchema>;

const inputs = [
  { name: 'title', placeholder: 'Address Title (Home,Work,etc.)' },
  { name: 'street_address', placeholder: 'Street Address' },
  { name: 'building', placeholder: 'Bldg' },
  { name: 'floor', placeholder: 'Floor' },
  { name: 'additional_info', placeholder: 'Additional Information*' },
];

const addressSchema = z.object({
  title: z.string().nonempty('Address Title is required'),
  street_address: z.string().nonempty('Street Address is required'),
  building: z.string().nonempty('Building is required'),
  floor: z.string().nonempty('Floor is required'),
  additional_info: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

type NavigationProp = NativeStackNavigationProp<
  ServiceSelectionStackParamList,
  'AddressMap'
>;

const AddressDetailsSheet = forwardRef<BottomSheet, Props>(
  ({ coordinates, editAddress, selectedZone, zones, isPointInPolygon }, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const isEditMode = !!editAddress;

    const {
      control,
      handleSubmit,
      setValue,
      reset,
      formState: { errors },
    } = useForm<AddressForm>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
    });

    const [addAddresses, { isLoading: addAddressesLoading }] = useAddAddressesMutation();
    const [updateAddress, { isLoading: updateAddressLoading }] = useUpdateAddressMutation();
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch();

    const isLoading = addAddressesLoading || updateAddressLoading;

    // Expose sheet methods via ref
    useImperativeHandle(ref, () => ({
      expand: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
      collapse: () => sheetRef.current?.collapse(),
      snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
      snapToPosition: (position: string | number) => sheetRef.current?.snapToPosition(position),
      forceClose: () => sheetRef.current?.forceClose(),
    } as BottomSheet));

    useEffect(() => {
      setValue('latitude', coordinates.latitude);
      setValue('longitude', coordinates.longitude);
    }, [coordinates]);

    // Populate form when editing
    useEffect(() => {
      if (editAddress) {
        setValue('title', editAddress.title || '');
        setValue('street_address', editAddress.street_address || '');
        setValue('building', editAddress.building || '');
        setValue('floor', editAddress.floor || '');
        setValue('additional_info', editAddress.additional_info || '');
        setValue('latitude', editAddress.latitude);
        setValue('longitude', editAddress.longitude);
      }
    }, [editAddress]);

    const onSubmit = async (data: AddressForm) => {
      // Check if the location is within a zone
      const point = {
        latitude: data.latitude,
        longitude: data.longitude,
      };

      const zoneInPoint = zones.find(zone =>
        isPointInPolygon(point, zone.boundary),
      );

      if (!zoneInPoint) {
        Toast.show({
          type: 'error',
          text1: 'Location not in coverage area',
          text2: 'Please select a location within our delivery zone',
          visibilityTime: 4000,
          position: 'bottom',
        });
        return;
      }

      try {
        if (isEditMode && editAddress) {
          await updateAddress({
            id: editAddress.id,
            address: {
              title: data.title,
              street_address: data.street_address,
              building: data.building,
              floor: data.floor,
              additional_info: data.additional_info,
              latitude: data.latitude,
              longitude: data.longitude,
              is_default: editAddress.is_default,
            },
          }).unwrap();
          sheetRef.current?.close();
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        } else {
          const response = await addAddresses({ addresses: [data] }).unwrap();

          console.log('response address', response);


          const newAddress = response.user_address?.[0];

          if (newAddress) {
            dispatch(
              setAddress({
                id: newAddress.id,
                title: newAddress.title,
                latitude: newAddress.latitude,
                longitude: newAddress.longitude,
              })
            );

            dispatch(setBranchName({ name: null, alias: null }));

            dispatch(
              setOrderType({
                menuType: 'delivery',
                orderTypeAlias: 'delivery',
              })
            );
          }
          sheetRef.current?.close();
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
        }
      } catch (error: any) {
        console.error('ERROR', error);
        const errorMessage =
          error?.data?.message ||
          'Failed to save address. Please try again.';
        Toast.show({
          type: 'error',
          text1: errorMessage,
          visibilityTime: 4000,
          position: 'bottom',
        });
      }
    };

    const handleSheetChange = (index: number) => {
      if (index === -1) {
        // Only reset form when sheet is closed in add mode
        // In edit mode, preserve the form values
        if (!isEditMode) {
          reset({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            title: '',
            street_address: '',
            building: '',
            floor: '',
            additional_info: '',
          });
        }
      }
    };

    const inputRefs = {
      title: React.useRef<any>(null),
      street_address: React.useRef<any>(null),
      building: React.useRef<any>(null),
      floor: React.useRef<any>(null),
      additional_info: React.useRef<any>(null),
    };

    const inputContainerRefs = {
      title: React.useRef<View>(null),
      street_address: React.useRef<View>(null),
      building: React.useRef<View>(null),
      floor: React.useRef<View>(null),
      additional_info: React.useRef<View>(null),
    };

    const scrollViewRef = useRef<any>(null);

    const handleInputSubmit = (currentInput: string) => {
      const names = Object.keys(inputRefs);
      const idx = names.indexOf(currentInput);

      if (currentInput === 'additional_info') {
        handleSubmit(onSubmit)();
      } else {
        const next = names[idx + 1];
        if (next) inputRefs[next as keyof typeof inputRefs]?.current?.focus();
      }
    };

    const scrollToFirstError = () => {
      const inputNames = ['title', 'street_address', 'building', 'floor', 'additional_info'];
      
      for (const inputName of inputNames) {
        if (errors[inputName as keyof typeof errors]?.message) {
          const inputRef = inputRefs[inputName as keyof typeof inputRefs];
          const containerRef = inputContainerRefs[inputName as keyof typeof inputContainerRefs];
          
          if (inputRef?.current) {
            inputRef.current.focus();
          }
          
          setTimeout(() => {
            if (containerRef?.current && scrollViewRef.current) {
              containerRef.current.measureLayout(
                scrollViewRef.current,
                (x, y) => {
                  scrollViewRef.current?.scrollTo({
                    y: Math.max(0, y - 50), 
                    animated: true,
                  });
                },
                () => {
                  const inputIndex = inputNames.indexOf(inputName);
                  const estimatedY = inputIndex * 80; 
                  scrollViewRef.current?.scrollTo({
                    y: Math.max(0, estimatedY - 50),
                    animated: true,
                  });
                }
              );
            }
          }, 150);
          break;
        }
      }
    };

    const handleSubmitWithErrorCheck = () => {
      handleSubmit(
        onSubmit,
        () => {
          scrollToFirstError();
        }
      )();
    };

    const Footer = ({ animatedFooterPosition }: BottomSheetFooterProps) => (
      <BottomSheetFooter
        animatedFooterPosition={animatedFooterPosition}
        style={{ paddingVertical: SCREEN_PADDING.vertical + 9 }}
      >
        <Button
          onPress={handleSubmitWithErrorCheck}
          isLoading={isLoading}
          icon={
            isEditMode ? (
              <Icon_Edit color={COLORS.lightColor} />
            ) : (
              <Icon_Add color={COLORS.lightColor} />
            )
          }
          iconPosition='left'
        >
          {isEditMode ? 'Update' : 'Add'}
        </Button>
      </BottomSheetFooter>
    );

    return (
      <DynamicSheet
        ref={sheetRef}
        footerComponent={Footer}
        maxDynamicContentSize={470}
        onChange={handleSheetChange}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {isEditMode ? 'Edit Address Details' : 'Add Address Details'}
          </Text>
        </View>
        <View style={{
          paddingBottom: 150,
        }}>
          <BottomSheetScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {inputs.map((inp) => (
              <View
                key={inp.name}
                ref={inputContainerRefs[inp.name as keyof typeof inputContainerRefs]}
              >
                <Controller
                  control={control}
                  name={inp.name as keyof AddressForm}
                  render={({ field: { onBlur, onChange, value } }) => (
                    <BottomSheetInput
                      ref={inputRefs[inp.name as keyof typeof inputRefs]}
                      placeholder={inp.placeholder}
                      value={value?.toString()}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={errors[inp.name as keyof AddressForm]?.message}
                      returnKeyType={inp.name === 'additional_info' ? 'done' : 'next'}
                      onSubmitEditing={() => handleInputSubmit(inp.name)}
                    />
                  )}
                />
              </View>
            ))}

          </BottomSheetScrollView>
        </View>
      </DynamicSheet>
    );
  }
);

export default AddressDetailsSheet;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { gap: 8, paddingBottom: 15 },
  title: { ...TYPOGRAPHY.TITLE, color: COLORS.black },
  addButton: { flexDirection: 'row', gap: 11, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { ...TYPOGRAPHY.BODY, color: COLORS.lightColor },
  formContainer: { gap: 24, paddingTop: 18 },
});
