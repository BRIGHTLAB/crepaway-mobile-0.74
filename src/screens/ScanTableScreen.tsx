import { BackHandler, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { parseQueryParams } from '../utils/parseQueryParams';
import { Code } from 'react-native-vision-camera';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import QrCodeCamera from '../components/QrCodeCamera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DineInStackParamList } from '../navigation/DineInStack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  setBranchTable,
  setOrderType,
  setSessionTableId,
} from '../store/slices/userSlice';

type NavigationProp = NativeStackNavigationProp<DineInStackParamList>;

const ScanTableScreen = () => {
  // const userState = useSelector((state: RootState) => state.user);

  const navigation = useNavigation<NavigationProp>();
  const userState = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

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
        setTimeout(() => {
          navigation.navigate('Pending');
        }, 200);
        try {
          console.log('branchTable', branchTable);
        } catch (error) {
          console.error('Error fetching scanned orders:', error);
        }
      }
    }
  };

  return (
    <View>
      <QrCodeCamera onScan={handleScan} text="Scan the QR code" />
    </View>
  );
};

export default ScanTableScreen;

const styles = StyleSheet.create({});
