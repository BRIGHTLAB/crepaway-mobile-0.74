import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon_Branch from '../../../../assets/SVG/Icon_Branch';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import Button from '../../UI/Button';
import SelectButton from '../../UI/SelectButton';
import DynamicSheet from '../DynamicSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  selectedBranch: string | null;
  onSelectPress: () => void;
};

const TakeawaySheet = forwardRef<BottomSheet, Props>(
  ({ onSelectPress, selectedBranch }, ref) => {
    // const handleProceed = () => {};
    const { bottom } = useSafeAreaInsets();
    return (
      <DynamicSheet ref={ref}>
        <BottomSheetView
          style={{
            paddingBottom: bottom + 10,
          }}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Take Away</Text>
            <Text style={styles.description}>
              Get ready! Please select the desired branch to proceed
            </Text>
          </View>

          <SelectButton
            iconLeft={<Icon_Branch />}
            onPress={onSelectPress}
            title={selectedBranch ? selectedBranch : 'Select Branch'}
          />
        </BottomSheetView>
        {/* <Button disabled={!selectedBranch} onPress={handleProceed}>
          Proceed
        </Button> */}
      </DynamicSheet>
    );
  },
);

export default TakeawaySheet;

const styles = StyleSheet.create({
  headerContainer: {
    gap: 8,
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.black,
  },
  description: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: '#8391A1',
  },
});
