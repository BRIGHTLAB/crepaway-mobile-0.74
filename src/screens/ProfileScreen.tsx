import BottomSheet, { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Icon_Edit from '../../assets/SVG/Icon_Edit';
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
import { useUploadImageMutation } from '../api/s3UploaderApi';
import OptionRow from '../components/Profile/OptionRow';
import ProfilePhotoSheet from '../components/Sheets/Profile/ProfilePhotoSheet';
import ProfileAvatar from '../components/Profile/ProfileAvatar';
import { ProfileStackParamList } from '../navigation/DeliveryTakeawayStack';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { data, isLoading } = useGetProfileQuery();
  const sheetRef = useRef<BottomSheet>(null);
  const [getSignedUrl, { error, isLoading: signedUrlLoading }] =
    useLazyGetSignedUrlQuery();
  const [updateProfile, { isLoading: updateProfileLoading }] =
    useUpdateProfileMutation();
  const [uploadImage, { isLoading: uploadImageLoading }] =
    useUploadImageMutation();

  const handleImageSelection = async (imageUri: string) => {
    const objectName = imageUri.split('/').pop();
    if (objectName) {
      console.log('Starting image upload');

      // Get the signed URL from your API
      const resp = await getSignedUrl({ objectName }).unwrap();

      // Fetch the image and convert it to a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      await uploadImage({ url: resp.signedUrl, file: blob });
      await updateProfile({ image_url: resp.key });
    }
  };

  const handlePhotoRemoved = async () => {
    await updateProfile({ image_url: null });
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
        onPress: () => { },
      },
      {
        icon: <Icon_User color={'black'} />,
        text: 'Rewards',
        disabled: true,
        onPress: () => { },
      },
      {
        icon: <Icon_Settings />,
        text: 'Settings',
        disabled: true,
        onPress: () => { },
      },
      {
        icon: <Icon_Share />,
        text: 'Refer a friend',
        disabled: true,
        onPress: () => { },
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
        onPress: () => { navigation.navigate('Wallet') },
      },
    ],
    [navigation],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={{ width: '100%' }}>
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {/* Profile Info Section */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                gap={16}
                alignItems="center"
                marginBottom={24}>
                {/* Profile Image - uses flex:1 to match actual layout */}
                <SkeletonPlaceholder.Item flex={1}>
                  <SkeletonPlaceholder.Item
                    width="100%"
                    aspectRatio={1}
                    borderRadius={65}
                  />
                </SkeletonPlaceholder.Item>
                {/* Name and Email */}
                <SkeletonPlaceholder.Item flex={2} gap={8}>
                  <SkeletonPlaceholder.Item width="75%" height={24} borderRadius={4} />
                  <SkeletonPlaceholder.Item width="90%" height={14} borderRadius={4} />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* Options List */}
              <SkeletonPlaceholder.Item
                backgroundColor={COLORS.card}
                width="100%"
                borderRadius={8}>
                {[...Array(8)].map((_, index) => (
                  <SkeletonPlaceholder.Item key={index}>
                    <SkeletonPlaceholder.Item
                      flexDirection="row"
                      alignItems="center"
                      padding={16}
                      gap={12}>
                      <SkeletonPlaceholder.Item width={24} height={24} borderRadius={12} />
                      <SkeletonPlaceholder.Item
                        width={index % 3 === 0 ? '55%' : index % 3 === 1 ? '65%' : '50%'}
                        height={16}
                        borderRadius={4}
                      />
                    </SkeletonPlaceholder.Item>
                    {index < 7 && (
                      <SkeletonPlaceholder.Item paddingHorizontal={16}>
                        <SkeletonPlaceholder.Item
                          width="100%"
                          height={1}
                          backgroundColor="#8391A1"
                          opacity={0.1}
                        />
                      </SkeletonPlaceholder.Item>
                    )}
                  </SkeletonPlaceholder.Item>
                ))}
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* user info section */}
        <View style={styles.infoContainer}>
          <View style={styles.imageContainer}>
            <ProfileAvatar
              imageUrl={data?.image_url}
              name={data?.name}
              style={{ width: '100%', aspectRatio: 1 }}
            />
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
                <Icon_Edit color={'black'} width={15} height={15} />
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
          renderItem={({ index, item }) => (
            <View>
              <OptionRow {...item} />
              {index !== options.length - 1 && (
                <View style={{ paddingHorizontal: 16 }}>
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
        onPhotoRemoved={handlePhotoRemoved}
        hasPhoto={!!data?.image_url}
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
});
