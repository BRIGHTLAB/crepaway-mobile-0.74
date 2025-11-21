import { PortalProvider } from '@gorhom/portal';
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { Provider } from 'react-redux';
import DeleteAnimation from './assets/lotties/Delete.json';
import i18n from './src/i18n';
import NavigationStack from './src/navigation/NavigationStack';
import store, { persistor } from './src/store/store';

import * as Sentry from '@sentry/react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { useGetPendingRatingQuery } from './src/api/ordersApi';
import ConfirmationPopup from './src/components/Popups/ConfirmationPopup';
import OrderRatingPopup from './src/components/Popups/OrderRatingPopup';



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

const AppContent = () => {
  const [popupDetails, setPopupDetails] = useState(initialPopupDetails);
  const [showRatingSheet, setShowRatingSheet] = useState(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  const { data: pendingOrderToRate } = useGetPendingRatingQuery(undefined, {
    skip: showRatingSheet || !isSplashFinished, // Skip query if rating sheet is already shown or splash hasn't finished
  });

  useEffect(() => {
    if (pendingOrderToRate?.id && isSplashFinished) {
      setShowRatingSheet(true);
    }
  }, [pendingOrderToRate, isSplashFinished]);

  const handleRatingClose = () => {
    setShowRatingSheet(false);
  };

  return (
    <>
      <NavigationStack onSplashFinish={() => setIsSplashFinished(true)} />
      <ConfirmationPopup
        visible={popupDetails.isVisible}
        title={popupDetails.title}
        lottieSrc={DeleteAnimation}
        onClose={() => setPopupDetails(initialPopupDetails)}
        onConfirm={() => setPopupDetails(initialPopupDetails)}
        message={popupDetails.message}
      />
      {pendingOrderToRate && (
        <OrderRatingPopup
          visible={showRatingSheet}
          onClose={handleRatingClose}
          orderId={pendingOrderToRate.id}
          title="Rate your last order"
        />
      )}
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
