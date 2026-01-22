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
import { z } from 'zod';
import Icon_Add from '../../../assets/SVG/Icon_Add';
import Icon_Edit from '../../../assets/SVG/Icon_Edit';
import { useAddAddressesMutation, useUpdateAddressMutation } from '../../api/addressesApi';
import { ServiceSelectionStackParamList } from '../../navigation/ServiceSelectionStack';
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
};

type AddressForm = z.infer<typeof addressSchema>;

const inputs = [
  { name: 'title', placeholder: 'Address Title (Home,Work,etc.)' },
  { name: 'street_address', placeholder: 'Street Address' },
  { name: 'building', placeholder: 'Bldg' },
  { name: 'floor', placeholder: 'Floor' },
  { name: 'additional_info', placeholder: 'Additional Information' },
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
  ({ coordinates, editAddress }, ref) => {
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
          navigation.goBack();
        } else {
          await addAddresses({ addresses: [data] }).unwrap();
          navigation.pop();
        }
      } catch (error) {
        console.error('ERROR', error);
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

    const Footer = ({ animatedFooterPosition }: BottomSheetFooterProps) => (
      <BottomSheetFooter
        animatedFooterPosition={animatedFooterPosition}
        style={{ paddingVertical: SCREEN_PADDING.vertical + 9 }}
      >
        <Button
          onPress={handleSubmit(onSubmit)}
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
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {inputs.map(inp => (
              <Controller
                key={inp.name}
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
