import BottomSheet, {TouchableOpacity} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon_Camera from '../../assets/SVG/Icon_Camera';
import Icon_Faq from '../../assets/SVG/Icon_Faq';
import Icon_Legal from '../../assets/SVG/Icon_Legal';
import Icon_Profile_Settings from '../../assets/SVG/Icon_Profile_Settings';
import Icon_Settings from '../../assets/SVG/Icon_Settings';
import Icon_Share from '../../assets/SVG/Icon_Share';
import Icon_Support from '../../assets/SVG/Icon_Support';
import Icon_User from '../../assets/SVG/Icon_User';
import Icon_Wallet from '../../assets/SVG/Icon_Wallet';
import {
  useGetProfileQuery,
  useLazyGetSignedUrlQuery,
  useUpdateProfileMutation,
} from '../api/profileApi';
import {useUploadImageMutation} from '../api/s3UploaderApi';
import OptionRow from '../components/Profile/OptionRow';
import ProfilePhotoSheet from '../components/Sheets/Profile/ProfilePhotoSheet';
import {ProfileStackParamList} from '../navigation/DeliveryTakeawayStack';
import {COLORS, SCREEN_PADDING, TYPOGRAPHY} from '../theme';

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const {data, isLoading} = useGetProfileQuery();
  const sheetRef = useRef<BottomSheet>(null);
  const [getSignedUrl, {error, isLoading: signedUrlLoading}] =
    useLazyGetSignedUrlQuery();
  const [updateProfile, {isLoading: updateProfileLoading}] =
    useUpdateProfileMutation();
  const [uploadImage, {isLoading: uploadImageLoading}] =
    useUploadImageMutation();

  const handleImageSelection = async (imageUri: string) => {
    const objectName = imageUri.split('/').pop();
    if (objectName) {
      console.log('Starting image upload');

      // Get the signed URL from your API
      const resp = await getSignedUrl({objectName}).unwrap();

      // Fetch the image and convert it to a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      await uploadImage({url: resp.signedUrl, file: blob});
      await updateProfile({image_url: resp.key});
    }
  };

  const options = useMemo(
    () => [
      {
        icon: <Icon_Profile_Settings />,
        text: 'Profile Settings',
        onPress: () => {
          navigation.navigate('ProfileSettings');
        },
      },
      {
        icon: <Icon_Support />,
        text: 'Support',
        disabled: true,
        onPress: () => {},
      },
      {
        icon: <Icon_User color={'black'} />,
        text: 'Rewards',
        disabled: true,
        onPress: () => {},
      },
      {
        icon: <Icon_Settings />,
        text: 'Settings',
        disabled: true,
        onPress: () => {},
      },
      {
        icon: <Icon_Share />,
        text: 'Refer a friend',
        disabled: true,
        onPress: () => {},
      },
      {
        icon: <Icon_Legal />,
        text: 'Legal',
        onPress: () => navigation.navigate('Legal'),
      },
      {
        icon: <Icon_Faq />,
        text: 'FAQ',
        onPress: () => navigation.navigate('FAQ'),
      },
      {
        icon: <Icon_Wallet />,
        text: 'Wallet',
        disabled: true,
        onPress: () => {},
      },
    ],
    [navigation],
  );

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={COLORS.primaryColor} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* user info section */}
        <View style={styles.infoContainer}>
          <View style={styles.imageContainer}>
            {data?.image_url ? (
              <FastImage
                source={{
                  uri: data.image_url,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
                style={styles.image}
              />
            ) : (
              <View
                style={[
                  styles.image,
                  {
                    backgroundColor: COLORS.darkColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}>
                <Text style={styles.imageAltText}>
                  {data?.name.split(' ').map(str => str.charAt(0))}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={() => sheetRef.current?.expand()}
              disabled={
                signedUrlLoading || updateProfileLoading || uploadImageLoading
              }>
              {signedUrlLoading ||
              updateProfileLoading ||
              uploadImageLoading ? (
                <ActivityIndicator size="small" color={COLORS.darkColor} />
              ) : (
                <Icon_Camera color={'black'} width={15} height={15} />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.name}>{data?.name}</Text>
            <Text style={styles.email}>{data?.email}</Text>
          </View>
        </View>
        <FlatList
          data={options}
          renderItem={({index, item}) => (
            <View>
              <OptionRow {...item} />
              {index !== options.length - 1 && (
                <View style={{paddingHorizontal: 16}}>
                  <View style={styles.seperator} />
                </View>
              )}
            </View>
          )}
          keyExtractor={(_, idx) => idx.toString()}
          style={styles.list}
        />
      </View>
      <ProfilePhotoSheet
        ref={sheetRef}
        onImageSelected={handleImageSelection}
      />
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SCREEN_PADDING.vertical,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    gap: 24,
    marginBottom: 46,
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 2,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1 / 1,
    borderRadius: 65,
  },
  cameraIcon: {
    padding: 8.5,
    borderRadius: 65,
    backgroundColor: COLORS.card,
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.darkColor,
  },
  email: {
    ...TYPOGRAPHY.TAGS,
    color: COLORS.foregroundColor,
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
  imageAltText: {
    ...TYPOGRAPHY.TITLE,
    textTransform: 'uppercase',
    color: COLORS.lightColor,
  },
});
