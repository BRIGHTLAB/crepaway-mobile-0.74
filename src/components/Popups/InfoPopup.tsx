import React from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme';
import Button from '../UI/Button';
import DynamicPopup from '../UI/DynamicPopup';

interface InfoPopupProps {
    visible: boolean;
    title?: string;
    onClose: () => void;
    message: string;
}

const InfoPopup: React.FC<InfoPopupProps> = ({
    visible,
    onClose,
    title,
    message,
}) => {
    return (
        <DynamicPopup visible={visible} onClose={onClose}>
            <View style={styles.popupContainer}>
                <View style={styles.textContainer}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    <Text style={styles.message}>{message}</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        variant="primary"
                        onPress={onClose}
                        style={styles.cancelButton}>
                        Okay
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

    cancelButton: {
        flex: 1,
    },

});

export default InfoPopup;
