import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme';
import Button from '../UI/Button';
import DynamicPopup from '../UI/DynamicPopup';

interface TableClosedPopupProps {
    visible: boolean;
    onClose: () => void;
}

const TableClosedPopup: React.FC<TableClosedPopupProps> = ({
    visible,
    onClose,
}) => {
    return (
        <DynamicPopup visible={visible} onClose={onClose}>
            <View style={styles.popupContainer}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Table Closed</Text>
                    <Text style={styles.message}>
                        The table has been closed. You will be redirected to the main menu.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        variant="primary"
                        onPress={onClose}
                        style={styles.okayButton}>
                        Okay
                    </Button>
                </View>
            </View>
        </DynamicPopup>
    );
};

const styles = StyleSheet.create({
    popupContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 24,
        minWidth: 300,
        maxWidth: 400,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        ...TYPOGRAPHY.HEADLINE,
        color: COLORS.foregroundColor,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        ...TYPOGRAPHY.BODY,
        color: COLORS.foregroundColor,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    okayButton: {
        minWidth: 120,
    },
});

export default TableClosedPopup;
