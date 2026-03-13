import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import { Code } from 'react-native-vision-camera';
import { useDispatch, useSelector } from 'react-redux';
import QrCodeCamera from '../components/QrCodeCamera';
import { DineInStackParamList } from '../navigation/DineInStack';
import {
  setBranchTable,
  setOrderType
} from '../store/slices/userSlice';
import { RootState } from '../store/store';
import { parseQueryParams } from '../utils/parseQueryParams';
import { useLazyGetDineInConfigQuery } from '../api/branchesApi';

type NavigationProp = NativeStackNavigationProp<DineInStackParamList>;

const ScanTableScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(false);
  const [getDineInConfig] = useLazyGetDineInConfigQuery();

  useFocusEffect(
    React.useCallback(() => {
      if (userState.branchTable || userState.tableSessionId) {
        navigation.navigate('Pending', { socketUrl: '' });
        setMounted(false);
      } else {
        setMounted(true);
      }

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          dispatch(
            setOrderType({
              menuType: null,
              orderTypeAlias: null,
            }),
          );
          return true;
        },
      );

      return () => backHandler.remove();
    }, [userState.branchTable, userState.tableSessionId, navigation, dispatch]),
  );

  const handleScan = async (code: Code) => {
    if (checkingConfig) return;

    const query = code.value?.split('?')?.[1];
    console.log('scanned', query);

    if (query) {
      const queryParams = parseQueryParams(query);
      const branchTable = queryParams?.branch_table;
      console.log('branchTable', queryParams);

      if (branchTable && !Array.isArray(branchTable)) {
        // Extract branch alias from branchTable (format: {branch-alias}.{table-number})
        const branchAlias = branchTable.split('.')[0];

        if (!branchAlias) return;

        setCheckingConfig(true);
        setMounted(false);

        try {
          console.log('Fetching dine-in config for branch:', branchAlias);
          const result = await getDineInConfig(branchAlias).unwrap();
          console.log('Dine-in config result:', result);

          if (!result.dinein_enabled) {
            Alert.alert(
              'Dine-In Unavailable',
              'Dine-in is currently not available for this branch.',
              [{ text: 'OK', style: 'default' }],
            );
            setMounted(true);
            setCheckingConfig(false);
            return;
          }

          if (!result.dinein_socket_url) {
            Alert.alert(
              'Configuration Error',
              'Dine-in is not properly configured for this branch. Please try again later.',
              [{ text: 'OK', style: 'default' }],
            );
            setMounted(true);
            setCheckingConfig(false);
            return;
          }

          dispatch(setBranchTable(branchTable));
          navigation.navigate('Pending', { socketUrl: result.dinein_socket_url });
        } catch (error) {
          console.error('Error fetching dine-in config:', error);
          Alert.alert(
            'Error',
            'Failed to check dine-in availability. Please try again.',
            [{ text: 'OK', style: 'default' }],
          );
          setMounted(true);
        } finally {
          setCheckingConfig(false);
        }
      }
    }
  };

  return (
    <View
      style={styles.container}
    >
      {mounted && <QrCodeCamera onScan={handleScan} text="Scan the QR code" />}
    </View>
  );
};

export default ScanTableScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  }
});
