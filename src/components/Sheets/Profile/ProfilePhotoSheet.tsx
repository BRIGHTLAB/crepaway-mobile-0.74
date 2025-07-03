import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { forwardRef, useCallback } from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CameraOptions,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import Icon_Camera from '../../../../assets/SVG/Icon_Camera';
import Icon_Gallery from '../../../../assets/SVG/Icon_Gallery';
import { RootStackParamList } from '../../../navigation/NavigationStack';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import Button from '../../UI/Button';
import DynamicSheet from '../DynamicSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onImageSelected?: (imageUri: string) => void;
};

const cameraOptions: CameraOptions = {
  mediaType: 'photo',
  includeBase64: false,
  maxHeight: 512,
  maxWidth: 512,
  quality: 0.8,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfilePhotoSheet = forwardRef<BottomSheet, Props>(
  ({ onImageSelected }, ref) => {
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useDispatch();

    const { bottom } = useSafeAreaInsets();
    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message:
                'This app needs access to your camera to take profile photos',
              buttonPositive: 'OK',
              buttonNegative: 'Cancel',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          return false;
        }
      } else {
        // For iOS, permissions are requested through info.plist
        return true;
      }
    };

    const handleCameraClick = useCallback(async () => {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        // Handle permission denied
        return;
      }

      launchCamera(cameraOptions, response => {
        if (response.didCancel) {
          console.log('User cancelled camera picker');
          return;
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
          return;
        }

        // Get the captured image URI
        const imageUri = response.assets?.[0]?.uri;
        if (imageUri) {
          // Close the bottom sheet
          if (ref && 'current' in ref && ref.current) {
            ref.current.close();
          }

          // Process the selected image
          processSelectedImage(imageUri);
        }
      });
    }, [ref]);

    const handleGalleryClick = useCallback(() => {
      launchImageLibrary(cameraOptions, response => {
        if (response.didCancel) {
          console.log('User cancelled gallery picker');
          return;
        } else if (response.errorCode) {
          console.log('Gallery Error: ', response.errorMessage);
          return;
        }

        // Get the selected image URI
        const imageUri = response.assets?.[0]?.uri;
        if (imageUri) {
          // Close the bottom sheet
          if (ref && 'current' in ref && ref.current) {
            ref.current.close();
          }

          // Process the selected image
          processSelectedImage(imageUri);
        }
      });
    }, [ref]);

    const processSelectedImage = useCallback(
      (imageUri: string) => {
        if (onImageSelected) {
          onImageSelected(imageUri);
        }
      },
      [onImageSelected],
    );

    return (
      <DynamicSheet ref={ref}>
        <BottomSheetView style={[styles.container, {
          paddingBottom: 10 + bottom
        }]}>
          <Text style={styles.title}>Profile Photo</Text>
          <Button
            onPress={handleCameraClick}
            isLoading={false}
            icon={<Icon_Camera color={COLORS.lightColor} />}
            iconPosition="left">
            Camera
          </Button>
          <Button
            onPress={handleGalleryClick}
            isLoading={false}
            icon={<Icon_Gallery color={COLORS.lightColor} />}
            iconPosition="left">
            Gallery
          </Button>
        </BottomSheetView>
      </DynamicSheet>
    );
  },
);

export default ProfilePhotoSheet;

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    textAlign: 'center',
    color: COLORS.black,
    marginBottom: 16,
  },
});
