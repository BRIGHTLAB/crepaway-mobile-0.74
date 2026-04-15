import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { COLORS } from '../../theme';

interface PaymentWebViewMessage {
    action: 'track_order' | 'back_to_cart' | 'success' | 'failed';
    order_id?: number | null;
    payment_id: number;
}

interface PaymentWebViewModalProps {
    visible: boolean;
    paymentUrl: string;
    onPaymentSuccess: (orderId: number | null, paymentId: number) => void;
    onPaymentFailure: (paymentId: number) => void;
    /** Called when the user taps the close (X) button to forcefully exit the payment flow. */
    onClose?: () => void;
    /** Timeout in seconds. When reached, the modal auto-closes and onTimeout is called. */
    timeoutSeconds?: number;
    onTimeout?: () => void;
}

const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PaymentWebViewModal: React.FC<PaymentWebViewModalProps> = ({
    visible,
    paymentUrl,
    onPaymentSuccess,
    onPaymentFailure,
    onClose,
    timeoutSeconds,
    onTimeout,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [remainingSeconds, setRemainingSeconds] = useState(timeoutSeconds ?? 0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onTimeoutRef = useRef(onTimeout);
    const hasTimedOutRef = useRef(false);

    // Keep onTimeout ref in sync without causing effect re-runs
    useEffect(() => {
        onTimeoutRef.current = onTimeout;
    }, [onTimeout]);

    // Reset timer when modal becomes visible
    useEffect(() => {
        if (visible && timeoutSeconds) {
            setRemainingSeconds(timeoutSeconds);
            hasTimedOutRef.current = false;
        }
        if (!visible) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [visible, timeoutSeconds]);

    // Countdown logic
    useEffect(() => {
        if (!visible || !timeoutSeconds) return;

        intervalRef.current = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [visible, timeoutSeconds]);

    // Handle timeout — use ref to avoid dependency on onTimeout
    useEffect(() => {
        if (visible && timeoutSeconds && remainingSeconds === 0 && !hasTimedOutRef.current) {
            hasTimedOutRef.current = true;
            onTimeoutRef.current?.();
        }
    }, [remainingSeconds, visible, timeoutSeconds]);



    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data: PaymentWebViewMessage = JSON.parse(event.nativeEvent.data);
            console.log('PaymentWebView message received:', data);

            if (data.action === 'track_order' || data.action === 'success') {
                onPaymentSuccess(data.order_id ?? null, data.payment_id);
            } else if (data.action === 'back_to_cart' || data.action === 'failed') {
                onPaymentFailure(data.payment_id);
            }
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    };

    const handleLoadStart = () => {
        setIsLoading(true);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const showTimer = !!timeoutSeconds;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => {
                // Intentionally empty - prevent back button from closing the modal
            }}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Spacer to keep title centered when close button is present */}
                    <View style={styles.headerSide}>
                        {onClose && (
                            <TouchableOpacity
                                onPress={onClose}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.headerTitle}>Complete Payment</Text>
                    <View style={styles.headerSide} />
                </View>

                {/* Countdown Banner — only when timeoutSeconds is provided */}
                {showTimer && (
                    <View style={styles.countdownBanner}>
                        <View style={styles.countdownContent}>
                            <Text style={styles.countdownIcon}>
                                ⏱
                            </Text>
                            <View style={styles.countdownTextContainer}>
                                <Text style={styles.countdownMainText}>
                                    {remainingSeconds === 0
                                        ? 'Payment session expired'
                                        : `This payment session will expire in ${formatTime(remainingSeconds)}`
                                    }
                                </Text>
                                {remainingSeconds > 0 && (
                                    <Text style={styles.countdownSubText}>
                                        The session will close automatically when time runs out
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* WebView - only render when URL is valid */}
                <View style={styles.webViewContainer}>
                    {paymentUrl ? (
                        <WebView
                            source={{ uri: paymentUrl }}
                            onMessage={handleMessage}
                            onLoadStart={handleLoadStart}
                            onLoadEnd={handleLoadEnd}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={false}
                            style={styles.webView}
                            // Android-specific props for production builds
                            mixedContentMode="compatibility"
                            allowsInlineMediaPlayback={true}
                            originWhitelist={['*']}
                            // Additional props for better compatibility
                            sharedCookiesEnabled={true}
                            thirdPartyCookiesEnabled={true}
                        />
                    ) : null}

                    {/* Loading Overlay */}
                    {isLoading && paymentUrl && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={COLORS.primaryColor} />
                            <Text style={styles.loadingText}>Loading payment page...</Text>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default PaymentWebViewModal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: `${COLORS.foregroundColor}20`,
    },
    headerSide: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: `${COLORS.foregroundColor}10`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 14,
        color: COLORS.darkColor,
        fontFamily: 'Poppins-Medium',
    },
    headerTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: COLORS.darkColor,
    },

    // Countdown banner
    countdownBanner: {
        backgroundColor: `${COLORS.secondaryColor}12`,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: `${COLORS.secondaryColor}20`,
    },
    countdownContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    countdownIcon: {
        fontSize: 20,
    },
    countdownTextContainer: {
        flex: 1,
        gap: 2,
    },
    countdownMainText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: COLORS.secondaryColor,
    },
    countdownSubText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: `${COLORS.secondaryColor}99`,
    },

    webViewContainer: {
        flex: 1,
    },
    webView: {
        flex: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: COLORS.foregroundColor,
    },
});
