import React, { forwardRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS, TYPOGRAPHY, SCREEN_PADDING } from '../../../theme';
import Button from '../../UI/Button';
import DynamicSheet from '../DynamicSheet';
import BottomSheet, { BottomSheetScrollView, BottomSheetView, BottomSheetFooter, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { TableWaiter } from '../../../screens/TableScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetWaiterInstructionsQuery } from '../../../api/dataApi';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

type Props = {
  waiter: TableWaiter;
  onSelectInstruction: (instruction: WaiterInstruction) => void;
};

const WaiterInstructionsSheet = forwardRef<BottomSheet, Props>(({
  waiter,
  onSelectInstruction,
}, ref) => {
  const { data: instructions, isLoading } = useGetWaiterInstructionsQuery();

  const Footer = ({ animatedFooterPosition }: BottomSheetFooterProps) => (
    <BottomSheetFooter
      animatedFooterPosition={animatedFooterPosition}
      style={{ paddingVertical: SCREEN_PADDING.vertical + 9 }}
    >
      <Button
        variant="primary"
        onPress={() => { (ref as React.RefObject<BottomSheetMethods>)?.current?.close() }}
      >
        Cancel
      </Button>
    </BottomSheetFooter>
  );

  return (
    <DynamicSheet ref={ref} footerComponent={Footer} snapPoints={['50%', '80%']}>
      {isLoading ? (
        <ActivityIndicator size={20} />
      ) : (
        <>
          <Text style={styles.waiterSheetTitle}>Request from Waiter</Text>
          <View style={styles.waiterProfile}>
            <FastImage
              style={styles.waiterSheetImage}
              source={{
                uri: waiter.image_url || 'https://placehold.co/200x200/png',
              }}
            />
            <Text style={styles.waiterSheetName}>{waiter.name}</Text>
          </View>
          <View
            style={{
              paddingBottom: 200,
            }}
          >
            <BottomSheetScrollView
              contentContainerStyle={styles.instructionsContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {instructions?.map((instruction, index) => (
                <View key={instruction.id + index} style={{ marginBottom: 8 }}>
                  <TouchableOpacity
                    style={styles.instructionItem}
                    onPress={() => onSelectInstruction(instruction)}>
                    <Text style={styles.instructionText}>{instruction.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </BottomSheetScrollView>
          </View>

        </>
      )}
    </DynamicSheet>
  );
});

export default WaiterInstructionsSheet;

const styles = StyleSheet.create({
  waiterSheetContainer: {
    padding: 16,
    gap: 20,
    paddingBottom: 150, // Add padding for footer
  },
  waiterSheetTitle: {
    ...TYPOGRAPHY.HEADLINE,
    textAlign: 'center',
    marginBottom: 8,
  },
  waiterProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  waiterSheetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  waiterSheetName: {
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    paddingTop: 18,
  },
  instructionItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  instructionText: {
    ...TYPOGRAPHY.BODY,
  },
});