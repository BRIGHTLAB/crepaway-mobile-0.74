import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme';
import Button from '../UI/Button';

type Props = {
    visible: boolean;
    onClose: () => void;
};

const BannedPopup = ({ visible, onClose }: Props) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.bannedTitle}>You have been banned from this table</Text>

                    <View style={styles.buttonContainer}>
                        <Button onPress={onClose}>
                            Okay
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default BannedPopup;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    bannedTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: COLORS.darkColor,
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
});