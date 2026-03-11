import LottieView, { AnimationObject } from 'lottie-react-native';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme';
import Button from '../UI/Button';
import DynamicPopup from '../UI/DynamicPopup';

interface ConfirmationPopupProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  lottieSrc?: AnimationObject;
  icon?: React.ReactNode;
  message: string;
  btnLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  cancelVariant?: 'accent' | 'secondary' | 'outline' | 'primary';
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  lottieSrc,
  icon,
  btnLoading,
  confirmText = 'Yes',
  cancelText = 'No',
  cancelVariant = 'accent',
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <DynamicPopup visible={visible} onClose={onClose}>
      <View style={styles.popupContainer}>
        {lottieSrc && (
          <View style={styles.lottieContainer}>
            <LottieView
              source={lottieSrc}
              style={{ width: '100%', height: '100%' }}
              autoPlay
              loop={true}
            />
          </View>
        )}
        {!lottieSrc && icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          <Text style={[styles.message, descriptionStyle]}>{message}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant={cancelVariant}
            onPress={onClose}
            style={styles.cancelButton}>
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onPress={onConfirm}
            style={styles.confirmButton}
            isLoading={btnLoading}>
            {confirmText}
          </Button>
        </View>
      </View>
    </DynamicPopup>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    flexDirection: 'column',
    gap: 24,
  },
  textContainer: {
    gap: 8,
  },
  message: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    alignSelf: 'center',
    color: COLORS.black,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  lottieContainer: {
    height: 150,
    width: 150,
    alignSelf: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ConfirmationPopup;
