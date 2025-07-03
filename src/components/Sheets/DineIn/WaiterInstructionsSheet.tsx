import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import Button from '../../UI/Button';
import DynamicSheet from '../DynamicSheet';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { TableWaiter } from '../../../screens/TableScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type InstructionType = {
  id: number;
  text: string;
};

type Props = {
  waiter: TableWaiter;
  instructions: InstructionType[];
  onSelectInstruction: (instruction: InstructionType) => void;
  sheetRef: React.RefObject<BottomSheet | null>;
};

const WaiterInstructionsSheet = ({
  waiter,
  instructions,
  onSelectInstruction,
  sheetRef,
}: Props) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <DynamicSheet ref={sheetRef}>
      <BottomSheetView style={[styles.waiterSheetContainer, {
        paddingBottom: bottom + 10
      }]}>
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
        <View style={styles.instructionsContainer}>
          {instructions.map(instruction => (
            <TouchableOpacity
              key={instruction.id}
              style={styles.instructionItem}
              onPress={() => onSelectInstruction(instruction)}>
              <Text style={styles.instructionText}>{instruction.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Button variant="primary" onPress={() => sheetRef.current?.close()}>
          Cancel
        </Button>
      </BottomSheetView>
    </DynamicSheet>
  );
};

export default WaiterInstructionsSheet;

const styles = StyleSheet.create({
  waiterSheetContainer: {
    padding: 16,
    gap: 20,
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
    gap: 12,
    marginBottom: 20,
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
