import 'react-native-get-random-values';
import { Alert, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import DeleteAnimation from './assets/lotties/Delete.json';
import store, { persistor } from './src/store/store';
import NavigationStack from './src/navigation/NavigationStack';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';

import ConfirmationPopup from './src/components/Popups/ConfirmationPopup';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const initialPopupDetails = {
  isVisible: false,
  title: '',
  message: '',
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
              <NavigationStack />
              <ConfirmationPopup
                visible={popupDetails.isVisible}
                title={popupDetails.title}
                lottieSrc={DeleteAnimation}
                onClose={() => setPopupDetails(initialPopupDetails)}
                onConfirm={() => setPopupDetails(initialPopupDetails)}
                message={popupDetails.message}
              />
            </PortalProvider>
          </GestureHandlerRootView>
          {/* </SafeAreaProvider> */}
        </PersistGate>
      </Provider>
    </I18nextProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
