import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Icon_Arrow_Right from '../../assets/SVG/Icon_Arrow_Right';
import {COLORS} from '../theme';

interface IProps {
  title?: string;
  iconPosition?: 'down' | 'right';
  onPress?: () => void;
  showView?: boolean;
}

const FlatListHeader = ({title, iconPosition, onPress, showView}: IProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {!showView ? null : (
        <TouchableOpacity onPress={onPress} style={styles.viewContainer}>
          <Text style={styles.view}>View all</Text>
          {iconPosition === 'right' ? (
            <Icon_Arrow_Right color={COLORS.darkColor} />
          ) : (
            <Icon_Arrow_Right />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FlatListHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    fontSize: 20,
    color: COLORS.darkColor,
  },
  viewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  view: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    fontSize: 14,
    color: COLORS.darkColor,
  },
});
