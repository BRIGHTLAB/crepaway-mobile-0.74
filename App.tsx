import { PortalProvider } from '@gorhom/portal';
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import type { ToastConfigParams } from 'react-native-toast-message';
import Icon_Cart from './assets/SVG/Icon_Cart';
import DeleteAnimation from './assets/lotties/Delete.json';
import i18n from './src/i18n';
import NavigationStack from './src/navigation/NavigationStack';
import store, { persistor } from './src/store/store';

import * as Sentry from '@sentry/react-native';
import { PersistGate } from 'redux-persist/integration/react';
import ConfirmationPopup from './src/components/Popups/ConfirmationPopup';
import { COLORS } from './src/theme';
import Icon_Spine from './assets/SVG/Icon_Spine';



const initialPopupDetails = {
  isVisible: false,
  title: '',
  message: '',
};

Sentry.init({
  dsn: 'https://a30c42d668d1a61831ae4fd56cf37dcf@o4510163872120832.ingest.us.sentry.io/4510163879591936',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  // sendDefaultPii: true,

  // include user session 

  // // Enable Logs
  // enableLogs: true,

  // // Configure Session Replay
  // replaysSessionSampleRate: 0.1,
  // replaysOnErrorSampleRate: 1,
  // integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

interface ToastProps {
  onViewCart?: () => void;
}

const toastConfig = {
  success: ({ text1, props, hide }: ToastConfigParams<ToastProps>) => {
    const { onViewCart } = props || {};
    
    const handleViewCart = () => {
      hide();
      onViewCart?.();
    };

    return (
      <View
        style={{
          backgroundColor: COLORS.darkColor,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
          marginHorizontal: 16,
          marginBottom: 80,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, }}>
          <Icon_Spine width={26} height={26} color={COLORS.white} />
          <Text
            style={{
              color: COLORS.white,
              fontSize: 12,
              fontFamily: 'Poppins-Regular',
              flex: 1,
            }}>
            {text1 || ''}
          </Text>
        </View>
        {onViewCart && (
          <TouchableOpacity
            onPress={handleViewCart}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: COLORS.white,
              borderRadius: 6,
            }}>
            <Text
              style={{
                color: COLORS.darkColor,
                fontSize: 12,
                fontFamily: 'Poppins-SemiBold',
              }}>
              View Cart
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
  error: ({ text1 }: ToastConfigParams<ToastProps>) => {
    return (
      <View
        style={{
          backgroundColor: COLORS.errorColor,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
          marginHorizontal: 16,
          marginBottom: 80,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 12,
            fontFamily: 'Poppins-Regular',
            flex: 1,
          }}>
          {text1 || 'An error occurred'}
        </Text>
      </View>
    );
  },
};

const AppContent = () => {
  const [popupDetails, setPopupDetails] = useState(initialPopupDetails);

  return (
    <>
      <NavigationStack />
      <ConfirmationPopup
        visible={popupDetails.isVisible}
        title={popupDetails.title}
        lottieSrc={DeleteAnimation}
        onClose={() => setPopupDetails(initialPopupDetails)}
        onConfirm={() => setPopupDetails(initialPopupDetails)}
        message={popupDetails.message}
      />
      <Toast config={toastConfig} />
    </>
  );
};

const App = () => {
  // firebase push notifications
  const [popupDetails, setPopupDetails] = useState(initialPopupDetails);

  const requestPermission = async () => {
    // For Android 13 (API level 33) and above, request the POST_NOTIFICATIONS permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs access to notifications',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission denied at runtime');
          return;
        } else {
          console.log('Notification permission granted at runtime');
        }
      } catch (error) {
        console.warn('Error requesting POST_NOTIFICATIONS permission', error);
        return;
      }
    }

    // Request Firebase Messaging permission (works for iOS and Android)
    // const enabled =
    //   authStatus === AuthorizationStatus.AUTHORIZED ||
    //   authStatus === AuthorizationStatus.PROVISIONAL;

    // if (enabled) {
    //   console.log("Firebase messaging permission granted.");
    // } else {
    //   console.log("Firebase messaging permission not granted.");
    // }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {/* <SafeAreaProvider> */}
          <GestureHandlerRootView>
            <PortalProvider>
              <AppContent />
            </PortalProvider>
          </GestureHandlerRootView>
          {/* </SafeAreaProvider> */}
        </PersistGate>
      </Provider>
    </I18nextProvider>
  );
};

export default Sentry.wrap(App);
const styles = StyleSheet.create({});
