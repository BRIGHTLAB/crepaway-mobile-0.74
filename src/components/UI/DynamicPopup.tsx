import React from 'react';
import {Modal, StyleSheet, Text, View, TouchableOpacity} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DynamicPopup: React.FC<Props> = ({visible, onClose, children}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>{children}</View>
      </View>
    </Modal>
  );
};

export default DynamicPopup;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
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
