import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import DynamicPopup from '../UI/DynamicPopup';
import LottieView, {AnimationObject} from 'lottie-react-native';
import Button from '../UI/Button';
import {TYPOGRAPHY, COLORS} from '../../theme';

interface ConfirmationPopupProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  lottieSrc?: AnimationObject;
  message: string;
  btnLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  lottieSrc,
  btnLoading,
  confirmText = 'Yes',
  cancelText = 'No',
}) => {
  return (
    <DynamicPopup visible={visible} onClose={onClose}>
      <View style={styles.popupContainer}>
        {lottieSrc && (
          <View style={styles.lottieContainer}>
            <LottieView
              source={lottieSrc}
              style={{width: '100%', height: '100%'}}
              autoPlay
              loop={true}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="accent"
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
    gap: 24,
  },
  lottieContainer: {
    height: 150,
    width: 150,
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
