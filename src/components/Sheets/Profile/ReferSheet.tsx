// TODO complete it later

import {StyleSheet, Text, View} from 'react-native';
import React, {forwardRef} from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import DynamicSheet from '../DynamicSheet';
import {COLORS, TYPOGRAPHY} from '../../../theme';
import FastImage from 'react-native-fast-image';
import {FlatList} from 'react-native-gesture-handler';

type Props = {};

const platforms = [
  {
    icon: '',
    name: 'Copy url',
    action: () => {},
  },
  {
    icon: '',
    name: 'WhatsApp',
    action: () => {},
  },
  {
    icon: '',
    name: 'Direct',
    action: () => {},
  },
  {
    icon: '',
    name: 'Telegram',
    action: () => {},
  },
  {
    icon: '',
    name: 'Messenger',
    action: () => {},
  },
  {
    icon: '',
    name: 'Twitter',
    action: () => {},
  },
  {
    icon: '',
    name: 'Messages',
    action: () => {},
  },
  {
    icon: '',
    name: 'More',
    action: () => {},
  },
];

const ReferSheet = forwardRef<BottomSheet, Props>(({}, ref) => {
  return (
    <DynamicSheet ref={ref}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Delivery</Text>
        <Text style={styles.description}>
          Get ready! Please select an address or add a new one to proceed
        </Text>
      </View>
      {/* <View style={styles.refContainer}>

    </View> */}
      <FlatList
        data={platforms}
        renderItem={({item}) => (
          <View
            style={{
              gap: 4,
              alignItems: 'center',
            }}>
            <FastImage source={{uri: ''}} />
            <Text>{item.name}</Text>
          </View>
        )}
        style={styles.refContainer}
      />
    </DynamicSheet>
  );
});

export default ReferSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.black,
  },
  description: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: '#8391A1',
  },
  refContainer: {
    columnGap: 36,
    rowGap: 20,
  },
});
