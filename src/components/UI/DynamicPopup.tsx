import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  closeOnBackdropPress?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DynamicPopup: React.FC<Props> = ({ visible, onClose, children, wide = false, closeOnBackdropPress = false, style }) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {closeOnBackdropPress ? (
          <TouchableWithoutFeedback onPress={handleBackdropPress}>
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback onPress={() => { }}>
                <View style={[styles.modalContainer, wide && { width: '90%' }, style]}>
                  {children}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.modalBackground}>
            <View style={[styles.modalContainer, wide && { width: '90%' }]}>
              {children}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DynamicPopup;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '90%',
    alignItems: 'center',
    elevation: 5,
    flexShrink: 1,
  },
  defaultText: {
    fontSize: 18,
    marginBottom: 15,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
