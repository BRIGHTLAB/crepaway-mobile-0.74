import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Icon_Arrow_Right from '../../../assets/SVG/Icon_Arrow_Right';
import {COLORS, SCREEN_PADDING} from '../../theme';

interface IProps {
  showAll?: boolean;
  setShowAll?: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  mainView?: boolean;
  hideViewAll?: boolean;
  onPress?: () => void;
  isLoading?: boolean;
}
const TopListHeader = ({
  showAll,
  setShowAll,
  title,
  mainView = true,
  onPress,
  hideViewAll = false,
  isLoading,
}: IProps) => {
  return (
    <View style={styles.topHeader}>
      <Text style={styles.topTitle}>{title}</Text>
      {!hideViewAll && (
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
          onPress={() => {
            if (isLoading) return;
            if (!mainView) {
              onPress?.();
            } else {
              setShowAll?.(!showAll);
            }
          }}>
          <Text style={styles.viewAll}>View all</Text>
          {!mainView ? (
            <Icon_Arrow_Right color={'black'} style={{marginBottom: 4}} />
          ) : (
            <>
              {showAll ? (
                <Icon_Arrow_Right
                  color={'black'}
                  style={{
                    transform: [
                      {
                        rotate: '270deg',
                      },
                    ],
                    marginBottom: 4,
                  }}
                />
              ) : (
                <Icon_Arrow_Right
                  color={'black'}
                  style={{
                    transform: [
                      {
                        rotate: '90deg',
                      },
                    ],
                  }}
                />
              )}
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TopListHeader;

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingBottom: 7,
  },
  topTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.darkColor,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
});
