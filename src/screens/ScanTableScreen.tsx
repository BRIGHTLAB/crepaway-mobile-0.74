import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
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

type NavigationProp = NativeStackNavigationProp<DineInStackParamList>;

const ScanTableScreen = () => {
  // const userState = useSelector((state: RootState) => state.user);

  const navigation = useNavigation<NavigationProp>();
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      dispatch(setBranchTable('ashrafieh.table1'));
    }, 100);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          dispatch(
            setOrderType({
              menuType: null,
              orderTypeAlias: null,
            }),
          );
          return true; // Prevent default behavior
        },
      );

      // Cleanup function that runs when screen loses focus or unmounts
      return () => backHandler.remove();
    }, [dispatch]),
  );

  useFocusEffect(React.useCallback(() => {
    setMounted(true);
  }, []))

  useEffect(() => {
    // if the user already was on a branch table
    if (userState.branchTable)
      setTimeout(() => {
        navigation.navigate('Pending');
      }, 100);
    console.log('should be navigating', userState.branchTable);
  }, [userState.branchTable]);

  const handleScan = async (code: Code) => {
    const query = code.value?.split('?')?.[1];

    console.log('scanned', query);

    if (query) {
      const queryParams = parseQueryParams(query);
      const branchTable = queryParams?.branch_table;
      console.log('branchTable', queryParams);
      if (branchTable && !Array.isArray(branchTable)) {
        dispatch(setBranchTable(branchTable));
        // setTimeout(() => {
        //   navigation.navigate('Pending');
        // }, 200);
        setMounted(false);
        try {
          console.log('branchTable', branchTable);
        } catch (error) {
          console.error('Error fetching scanned orders:', error);
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
