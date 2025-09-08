import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import Toast from 'react-native-simple-toast';
import { z } from 'zod';
import DeleteAnimation from '../../assets/lotties/Delete.json';
import LogoutAnimation from '../../assets/lotties/Log_out.json';
import Icon_Alert from '../../assets/SVG/Icon_Alert';
import Icon_Credit_Card from '../../assets/SVG/Icon_Credit_Card';
import Icon_Delete from '../../assets/SVG/Icon_Delete';
import Icon_Edit from '../../assets/SVG/Icon_Edit';
import Icon_Location from '../../assets/SVG/Icon_Location';
import Icon_Sign_Out from '../../assets/SVG/Icon_Sign_Out';
import Icon_Wishlist_Filled from '../../assets/SVG/Icon_Wishlist_Filled';
import {
  useDeleteAccountMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '../api/profileApi';
import ConfirmationPopup from '../components/Popups/ConfirmationPopup';
import OptionRow from '../components/Profile/OptionRow';
import Button from '../components/UI/Button';
import DateInput from '../components/UI/DateInput';
import Input from '../components/UI/Input';
import { ProfileStackParamList } from '../navigation/DeliveryTakeawayStack';
import { logoutUser } from '../store/slices/userSlice';
import { useAppDispatch } from '../store/store';
import { COLORS, INPUT_HEIGHT, SCREEN_PADDING, TOAST_OFFSET, TYPOGRAPHY } from '../theme';

const profileSchema = z.object({
  name: z.string().nonempty('Name is required'),
  dob: z.date({
    required_error: 'Date of birth is required',
  }),
});

const ProfileSettingsScreen = () => {
  const {
    control,
    formState: { errors },
    setValue,
    handleSubmit,
    trigger,
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const { data, isLoading } = useGetProfileQuery();
  const [countryCode, setCountryCode] = useState<CountryCode>('LB');
  const [callingCode, setCallingCode] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [updateProfile, { isLoading: updateProfileLoading }] =
    useUpdateProfileMutation();

  const [deleteAccount, { isLoading: deleteAccLoading }] =
    useDeleteAccountMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const options = useMemo(
    () => [
      {
        icon: <Icon_Location color={COLORS.darkColor} />,
        text: 'Address',
        onPress: () => {
          navigation.navigate('Addresses');
        },
      },
      {
        icon: <Icon_Credit_Card />,
        text: 'Payment methods',
        onPress: () => navigation.navigate('PaymentMethods'),
      },
      {
        icon: <Icon_Wishlist_Filled color={COLORS.darkColor} />,
        text: 'Favorites',
        onPress: () => navigation.navigate('FavoriteItems'),
      },
      {
        icon: <Icon_Alert />,
        text: 'Allergies',
        onPress: () => navigation.navigate('Allergies'),
      },
      // {
      //   icon: <Icon_Pass />,
      //   text: 'Reset Password',
      //   onPress: () => {},
      // },
      {
        icon: <Icon_Delete />,
        text: 'Delete Account',
        onPress: () => setShowDeleteModal(true),
      },
      {
        icon: <Icon_Sign_Out />,
        text: 'Sign Out',
        onPress: () => setShowSignOutModal(true),
      },
    ],
    [navigation],
  );

  useEffect(() => {
    if (data) {
      const dobDate = new Date(data.dob);
      setValue('name', data.name);
      setValue('dob', dobDate);
      setHasChanged(false); // Reset hasChanged when data loads
      setCallingCode(
        data?.phone_number?.split(' ')?.[0]?.replace('+', '') || '',
      );
    }
  }, [data, setValue]);

  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccount();
      Toast.showWithGravityAndOffset('Account deleted successfully', Toast.SHORT, Toast.BOTTOM, 0, TOAST_OFFSET);
      dispatch(logoutUser());
    } catch (error) {
      console.log(error);
      Toast.showWithGravityAndOffset('Failed to delete account. Please try again.', Toast.SHORT, Toast.BOTTOM, 0, TOAST_OFFSET);
    }
  };

  const handleConfirmSignOut = () => {
    Toast.showWithGravityAndOffset('Signed out successfully', Toast.SHORT, Toast.BOTTOM, 0, TOAST_OFFSET);
    dispatch(logoutUser());
  };

  const onSubmit = async (data: any) => {
    console.log('data is 123', data);
    try {
      await updateProfile(data).unwrap();
      setHasChanged(false); // Reset hasChanged after successful update
      Toast.showWithGravityAndOffset('Profile updated successfully!', Toast.SHORT, Toast.BOTTOM, 0, TOAST_OFFSET);
    } catch (error) {
      console.error('ERROR', error);
      Toast.showWithGravityAndOffset('Failed to update profile. Please try again.', Toast.SHORT, Toast.BOTTOM, 0, TOAST_OFFSET);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        {/* name & date of birth */}
        <View style={[styles.card, { gap: 16 }]}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                  setHasChanged(true);
                }}
                value={value}
                placeholder="Name"
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="dob"
            render={({ field: { onChange, onBlur, value } }) => (
              <DateInput
                value={value}
                onChange={(date) => {
                  onChange(date);
                  setHasChanged(true);
                }}
                error={errors.dob?.message}
                mode="date"
                placeholder="Date of Birth"
              // returnKeyType="next"
              />
            )}
          />
          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={updateProfileLoading}
            disabled={!hasChanged}
            icon={<Icon_Edit color={COLORS.lightColor} />}
            iconPosition="left">
            Edit
          </Button>
        </View>

        {/* email address */}
        <View style={[styles.card]}>
          <Input
            value={data?.email}
            placeholder="Email Address"
            error={errors.name?.message}
            iconRight={<Icon_Edit color={COLORS.placeholderColor} />}
            disabled
          />
        </View>

        {/* phone number */}
        <View
          style={[
            styles.card,
            {
              flexDirection: 'row',
              gap: 16,
            },
          ]}>
          <View
            style={styles.countryPicker}
          // onPress={() => setShowCountryPicker(true)}
          >
            <CountryPicker
              countryCode={countryCode}
              withFlag
              withCallingCode
              withFilter
              withAlphaFilter
              onSelect={country => {
                setCountryCode(country.cca2);
                setCallingCode(country.callingCode[0]);
                setShowCountryPicker(false);
              }}
              visible={showCountryPicker}
            />
            <Text style={styles.callingCode}>+{callingCode}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Input
              // onBlur={onBlur}
              // onChangeText={onChange}
              // value={value}
              value={data?.phone_number?.split(' ')?.[1] || ''}
              placeholder="Mobile Number"
              error={errors.name?.message}
              iconRight={<Icon_Edit color={COLORS.placeholderColor} />}
              disabled
            />
          </View>
        </View>
        <View style={styles.list}>
          {options.map((option, idx) => (
            <View key={idx}>
              <OptionRow {...option} />
              {idx !== options.length - 1 && (
                <View style={{ paddingHorizontal: 16 }}>
                  <View style={styles.seperator} />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <ConfirmationPopup
        visible={showDeleteModal}
        title="Delete Account"
        lottieSrc={DeleteAnimation}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDeleteAccount}
        message={`Are you sure you want to delete your account and all related preferences ?`}
        btnLoading={deleteAccLoading}
      />
      <ConfirmationPopup
        visible={showSignOutModal}
        title="Sign Out"
        lottieSrc={LogoutAnimation}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
        message={`Are you sure you want to sign out ?`}
        btnLoading={false}
      />
    </ScrollView>
  );
};

export default ProfileSettingsScreen;

const styles = StyleSheet.create({
  scrollView: {
    paddingVertical: SCREEN_PADDING.vertical,
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  container: {
    gap: 24,
    marginBottom: 45,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
  },
  list: {
    backgroundColor: COLORS.card,
    width: '100%',
    borderRadius: 8,
  },
  seperator: {
    width: '100%',
    height: 2,
    backgroundColor: '#8391A1',
    opacity: 0.1,
  },

  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    pointerEvents: 'none',
    backgroundColor: COLORS.lightColor,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    padding: 12,
    height: INPUT_HEIGHT,
    maxWidth: 110,
    overflow: 'hidden',
  },
  callingCode: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.darkColor,
  },
});
