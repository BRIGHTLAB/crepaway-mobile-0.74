import {StyleSheet, Text, View} from 'react-native';
import {CircularProgress} from 'react-native-svg-circular-progress';
import {COLORS} from '../../theme';

interface IProps {
  title: string | null;
  percentage: number | null;
  color: string | null;
}

const TasteTriadProgress = ({title, percentage, color}: IProps) => {
  return (
    <View>
      <CircularProgress
        percentage={percentage}
        donutColor={color}
        size={72}
        blankColor={'#F3F4F6'}
        progressWidth={28}>
        <View style={styles.innerContainer}>
          <Text style={styles.percentage}>{percentage}%</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </CircularProgress>
    </View>
  );
};

export default TasteTriadProgress;

const styles = StyleSheet.create({
  innerContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: COLORS.darkColor,
  },
  percentage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkColor,
  },
});
