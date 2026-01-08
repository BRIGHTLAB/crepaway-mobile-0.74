import BottomSheet, {
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { forwardRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import Icon_Add from '../../../assets/SVG/Icon_Add';
import { useAddAddressesMutation } from '../../api/addressesApi';
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
  ({ coordinates }, ref) => {
    const {
      control,
      handleSubmit,
      setValue,
      formState: { errors },
      trigger,
    } = useForm<AddressForm>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
    });

    const [addAddresses, { isLoading: addAddressesLoading }] = useAddAddressesMutation();
    const navigation = useNavigation<NavigationProp>();

    useEffect(() => {
      setValue('latitude', coordinates.latitude);
      setValue('longitude', coordinates.longitude);
    }, [coordinates]);

    const onSubmit = async (data: AddressForm) => {
      try {
        await addAddresses({ addresses: [data] }).unwrap();
        navigation.pop();
      } catch (error) {
        console.error('ERROR', error);
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
        <Button onPress={handleSubmit(onSubmit)} isLoading={addAddressesLoading}
          icon={
            <Icon_Add color={COLORS.lightColor} />
          }
          iconPosition='left'>

          Add
        </Button>
      </BottomSheetFooter>
    );

    return (
      <DynamicSheet
        ref={ref}
        footerComponent={Footer}
        maxDynamicContentSize={470}
      // keyboard handling props
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Add Address Details</Text>
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
