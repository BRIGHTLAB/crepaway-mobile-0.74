import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Icon_Send from "../../../assets/SVG/Icon_Send";
import { useRateOrderMutation } from "../../api/ordersApi";
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from "../../theme";
import Button from "../UI/Button";
import DynamicPopup from "../UI/DynamicPopup";
import Input from "../UI/Input";
import StarsRating from "../UI/StarsRating";

type Props = {
    visible: boolean;
    onClose: () => void;
    orderId: number;
    title?: string;
};

const OrderRatingPopup: React.FC<Props> = ({ visible, onClose, orderId, title = "Rate Your Order" }) => {
    const [foodRating, setFoodRating] = useState(0);
    const [experienceRating, setExperienceRating] = useState(0);
    const [serviceRating, setServiceRating] = useState(0);
    const [specialFeedback, setSpecialFeedback] = useState('');
    const [rateOrder, { isLoading }] = useRateOrderMutation();

    // Check if all ratings are valid (between 1 and 5)
    const isFormValid = foodRating >= 1 && foodRating <= 5 &&
        experienceRating >= 1 && experienceRating <= 5 &&
        serviceRating >= 1 && serviceRating <= 5;

    const handleSubmit = async () => {
        try {
            await rateOrder({
                orderId,
                payload: {
                    food_rating: foodRating,
                    experience_rating: experienceRating,
                    service_rating: serviceRating,
                    review_comment: specialFeedback.trim() || null,
                },
            }).unwrap();

            // Reset form and close on success
            setFoodRating(0);
            setExperienceRating(0);
            setServiceRating(0);
            setSpecialFeedback('');
            onClose();
        } catch (error: any) {
            console.error('Error submitting rating:', error);
        }
    };

    return (
        <DynamicPopup visible={visible} onClose={onClose} wide closeOnBackdropPress>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>{title}</Text>
                </View>
                <ScrollView
                    contentContainerStyle={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <StarsRating title="Food" rating={foodRating} onRatingChange={(rating: number) => {
                        setFoodRating(rating);
                    }} />
                    <StarsRating title="Experience" rating={experienceRating} onRatingChange={(rating: number) => {
                        setExperienceRating(rating);
                    }} />
                    <StarsRating title="Service" rating={serviceRating} onRatingChange={(rating: number) => {
                        setServiceRating(rating);
                    }} />
                    <Input
                        value={specialFeedback}
                        onChangeText={(text: string) => {
                            setSpecialFeedback(text);
                        }}
                        placeholder="Special Feedback"
                        multiline
                        lines={4}
                    />
                </ScrollView>
                <Button
                    onPress={handleSubmit}
                    icon={<Icon_Send color={COLORS.white} />}
                    iconPosition="left"
                    disabled={!isFormValid || isLoading}
                    isLoading={isLoading}
                >
                    Submit
                </Button>
            </View>
        </DynamicPopup>
    );
};

export default OrderRatingPopup;


const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
    },
    headerContainer: {
        gap: 8,
    },
    headerText: {
        ...TYPOGRAPHY.TITLE,
        color: COLORS.black,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center'
    },
    formContainer: {
        gap: 24,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        padding: 12,
        textAlignVertical: 'top',
        ...TYPOGRAPHY.BODY,
        color: COLORS.black,
    },
    buttonContainer: {
        paddingTop: 20,
        paddingHorizontal: SCREEN_PADDING.horizontal,
    },
});