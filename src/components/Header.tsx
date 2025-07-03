import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';
import Icon_BackArrow from '../../assets/SVG/Icon_BackArrow';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/NavigationStack';
import {COLORS} from '../theme';

interface IProps {
  title?: string;
  color?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CustomHeader: React.FC<IProps> = ({
  title = 'Back',
  color = COLORS.darkColor,
}) => {
  const navigation = useNavigation<NavigationProp>();
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
        onPress={() => navigation.goBack()}
        style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Icon_BackArrow color={color} />
        <Text style={[styles.headerTitle, {color: color}]}>{title}</Text>
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
