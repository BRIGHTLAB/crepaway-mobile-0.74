import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon_BackArrow from '../../assets/SVG/Icon_BackArrow';
import { RootStackParamList } from '../navigation/NavigationStack';
import { setOrderType } from '../store/slices/userSlice';
import { useAppDispatch } from '../store/store';
import { COLORS } from '../theme';

interface IProps {
  title?: string;
  color?: string;
  clearOrderType?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CustomHeader: React.FC<IProps> = ({
  title = 'Back',
  color = COLORS.darkColor,
  clearOrderType = false,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const handleBackPress = () => {
    if (clearOrderType) {
      console.log('clear order type');
      dispatch(
        setOrderType({
          menuType: null,
          orderTypeAlias: null,
        }),
      );
    } else {
      console.log('normal back navigation');
      navigation.goBack();
    }
  };

  return (
    <View
      style={{
        width: 70,
        height: 30,
        paddingTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        onPress={handleBackPress}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon_BackArrow color={color} />
        <Text style={[styles.headerTitle, { color: color }]}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.darkColor,
  },
});
