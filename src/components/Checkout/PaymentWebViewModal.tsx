import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { COLORS } from '../../theme';

interface PaymentWebViewMessage {
    action: 'track_order' | 'back_to_cart';
    order_id?: number | null;
    payment_id: number;
}

interface PaymentWebViewModalProps {
    visible: boolean;
    paymentUrl: string;
    onPaymentSuccess: (orderId: number | null, paymentId: number) => void;
    onPaymentFailure: (paymentId: number) => void;
}

const PaymentWebViewModal: React.FC<PaymentWebViewModalProps> = ({
    visible,
    paymentUrl,
    onPaymentSuccess,
    onPaymentFailure,
}) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleMessage = (event: WebViewMessageEvent) => {
        try {
            const data: PaymentWebViewMessage = JSON.parse(event.nativeEvent.data);
            console.log('PaymentWebView message received:', data);

            if (data.action === 'track_order') {
                // Payment succeeded - navigate to order tracking
                onPaymentSuccess(data.order_id ?? null, data.payment_id);
            } else if (data.action === 'back_to_cart') {
                // Payment failed or cancelled - return to cart
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
                    <Text style={styles.headerTitle}>Complete Payment</Text>
                </View>

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
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: `${COLORS.foregroundColor}20`,
    },
    headerTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: COLORS.darkColor,
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
