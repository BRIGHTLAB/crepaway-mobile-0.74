import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Icon_Notification from '../../../assets/SVG/Icon_Notification';
import {COLORS, TYPOGRAPHY} from '../../theme';
import {useSelector} from 'react-redux';
import {RootState} from '../../store/store';

const NotificationsCounter = ({color}: {color?: string}) => {
  const state = useSelector((state: RootState) => state.notifications);
  const count = state.data.filter(item => !item.is_read).length;
  return (
    <View style={styles.container}>
      <Icon_Notification
        width={26}
        height={26}
        style={styles.iconStyle}
        color={color || '#191919'}
      />
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{count}</Text>
      </View>
    </View>
  );
};

export default NotificationsCounter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center'
  },
  iconStyle: {
    marginTop: 5, 
    marginRight: 3,
  },
  counterContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primaryColor,
    width: 18,
    height: 18,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: 'white',
  },
});
