import BottomSheet, {
    BottomSheetFooter,
    BottomSheetFooterProps,
    BottomSheetScrollView
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon_Send from '../../../assets/SVG/Icon_Send';
import { OrderRatingPayload, useRateOrderMutation } from '../../api/ordersApi';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../theme';
import BottomSheetInput from '../UI/BottomSheetInput';
import Button from '../UI/Button';
import StarsRating from '../UI/StarsRating';
import DynamicSheet from './DynamicSheet';

export type OrderRatingSheetRef = {
    expand: () => void;
    close: () => void;
};

type Props = {
    orderId: number;
    title?: string;
    rating?: OrderRatingPayload | null;
    disabled?: boolean;
    onClose?: () => void;
};

const OrderRatingSheet = forwardRef<OrderRatingSheetRef, Props>(
    ({ orderId, title = 'Rate Your Order', rating, disabled = false, onClose }, ref) => {
        const sheetRef = useRef<BottomSheet>(null);
        const [foodRating, setFoodRating] = useState(0);
        const [experienceRating, setExperienceRating] = useState(0);
        const [serviceRating, setServiceRating] = useState(0);
        const [specialFeedback, setSpecialFeedback] = useState('');
        const [rateOrder, { isLoading }] = useRateOrderMutation();

        // Expose sheet methods via ref
        useImperativeHandle(ref, () => ({
            expand: () => sheetRef.current?.expand(),
            close: () => sheetRef.current?.close(),
        }));

        // Initialize state from rating prop if provided
        useEffect(() => {
            if (rating) {
                setFoodRating(rating.food_rating);
                setExperienceRating(rating.experience_rating);
                setServiceRating(rating.service_rating);
                setSpecialFeedback(rating.review_comment || '');
            } else {
                setFoodRating(0);
                setExperienceRating(0);
                setServiceRating(0);
                setSpecialFeedback('');
            }
        }, [rating]);

        // Check if all ratings are valid (between 1 and 5)
        const isFormValid =
            foodRating >= 1 &&
            foodRating <= 5 &&
            experienceRating >= 1 &&
            experienceRating <= 5 &&
            serviceRating >= 1 &&
            serviceRating <= 5;

        // Disable submit if disabled prop is true or if rating already exists
        const isSubmitDisabled = disabled || !!rating || !isFormValid || isLoading;

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
                sheetRef.current?.close();
            } catch (error: any) {
                console.error('Error submitting rating:', error);
            }
        };

        const handleSheetChange = (index: number) => {
            if (index === -1) {
                // Reset form when sheet is closed if not in disabled mode
                if (!disabled) {
                    setFoodRating(rating?.food_rating ?? 0);
                    setExperienceRating(rating?.experience_rating ?? 0);
                    setServiceRating(rating?.service_rating ?? 0);
                    setSpecialFeedback(rating?.review_comment ?? '');
                }
                onClose?.();
            }
        };

        const Footer = ({ animatedFooterPosition }: BottomSheetFooterProps) => (
            <BottomSheetFooter
                animatedFooterPosition={animatedFooterPosition}
                style={{ paddingVertical: SCREEN_PADDING.vertical + 9 }}
            >
                <Button
                    onPress={handleSubmit}
                    icon={<Icon_Send color={COLORS.white} />}
                    iconPosition="left"
                    disabled={isSubmitDisabled}
                    isLoading={isLoading}
                >
                    Submit
                </Button>
            </BottomSheetFooter>
        );

        return (
            <DynamicSheet
                ref={sheetRef}
                footerComponent={Footer}
                maxDynamicContentSize={800}
                onChange={handleSheetChange}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>{title}</Text>
                </View>
                <BottomSheetScrollView
                    contentContainerStyle={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <StarsRating
                        title="Food"
                        rating={foodRating}
                        onRatingChange={
                            disabled
                                ? undefined
                                : (newRating: number) => {
                                    setFoodRating(newRating);
                                }
                        }
                    />
                    <StarsRating
                        title="Experience"
                        rating={experienceRating}
                        onRatingChange={
                            disabled
                                ? undefined
                                : (newRating: number) => {
                                    setExperienceRating(newRating);
                                }
                        }
                    />
                    <StarsRating
                        title="Service"
                        rating={serviceRating}
                        onRatingChange={
                            disabled
                                ? undefined
                                : (newRating: number) => {
                                    setServiceRating(newRating);
                                }
                        }
                    />
                    <BottomSheetInput
                        value={specialFeedback}
                        onChangeText={(text: string) => {
                            setSpecialFeedback(text);
                        }}
                        placeholder="Special Feedback"
                        multiline
                        numberOfLines={4}
                        disabled={disabled}
                    />
                </BottomSheetScrollView>
            </DynamicSheet>
        );
    }
);

export default OrderRatingSheet;

const styles = StyleSheet.create({
    headerContainer: {
        gap: 8,
        paddingBottom: 15,
    },
    headerText: {
        ...TYPOGRAPHY.TITLE,
        color: COLORS.black,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'center',
    },
    formContainer: {
        gap: 24,
        paddingTop: 18,
        paddingBottom: 150,
    },
});
