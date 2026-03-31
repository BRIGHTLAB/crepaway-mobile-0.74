import BottomSheet, { BottomSheetFooter, BottomSheetFooterProps, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon_Bell from '../../../../assets/SVG/Icon_Bell';
import { useGetWaiterInstructionsQuery } from '../../../api/dataApi';
import { TableWaiter } from '../../../screens/TableScreen';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../../../theme';
import BottomSheetInput from '../../UI/BottomSheetInput';
import Button from '../../UI/Button';
import DynamicSheet from '../DynamicSheet';

type Props = {
  waiter: TableWaiter;
  onSelectInstruction: (instruction: WaiterInstruction) => void;
};

const WaiterInstructionsSheet = forwardRef<BottomSheet, Props>(({
  waiter,
  onSelectInstruction,
}, ref) => {
  const { data: instructions, isLoading } = useGetWaiterInstructionsQuery();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [specialInstruction, setSpecialInstruction] = useState('');
  const { bottom } = useSafeAreaInsets();

  const toggleInstruction = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSendRequest = () => {
    // Send each selected instruction
    const selected = instructions?.filter(i => selectedIds.includes(i.id)) || [];
    selected.forEach(instruction => {
      onSelectInstruction(instruction);
    });

    // If there's a special instruction, send it as well
    if (specialInstruction.trim()) {
      onSelectInstruction({
        id: -1,
        name: 'Special Instruction',
        description: specialInstruction.trim(),
        type: 'custom',
      });
    }

    // Reset state and close sheet
    setSelectedIds([]);
    setSpecialInstruction('');
    (ref as React.RefObject<BottomSheet>)?.current?.close();
  };

  // Keep a stable ref to avoid re-creating the footer on state changes
  const handleSendRequestRef = useRef(handleSendRequest);
  handleSendRequestRef.current = handleSendRequest;

  const renderFooter = useCallback(
    ({ animatedFooterPosition }: BottomSheetFooterProps) => (
      <BottomSheetFooter
        animatedFooterPosition={animatedFooterPosition}
        style={{ paddingVertical: SCREEN_PADDING.vertical + 9, paddingHorizontal: SCREEN_PADDING.horizontal }}
      >
        <Button
          variant="primary"
          onPress={() => handleSendRequestRef.current()}
          icon={<Icon_Bell width={16} height={14} color={COLORS.white} />}
        >
          Send Request
        </Button>
      </BottomSheetFooter>
    ),
    [],
  );

  return (
    <DynamicSheet ref={ref} footerComponent={renderFooter} contentStyle={{ paddingHorizontal: 0 }}>
      <BottomSheetView
        style={{ gap: 12, paddingBottom: 80 + bottom }}
        onTouchStart={() => Keyboard.dismiss()}
      >
        {isLoading ? (
          <ActivityIndicator size={20} />
        ) : (
          <>
            <Text style={styles.title}>Send Request</Text>
            <Text style={styles.description}>
              You can choose one or more items from the below list or simply type your request.
            </Text>

            {/* Instruction chips - horizontal scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
              style={styles.chipsScroll}
            >
              {instructions?.map((instruction) => {
                const isSelected = selectedIds.includes(instruction.id);
                return (
                  <TouchableOpacity
                    key={instruction.id}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => toggleInstruction(instruction.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.chipCheckbox, isSelected && styles.chipCheckboxSelected]}>
                      {isSelected && <Text style={styles.chipCheckmark}>✓</Text>}
                    </View>
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {instruction.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Special instruction input */}
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <BottomSheetInput
                placeholder="Special Instruction"
                placeholderTextColor={COLORS.foregroundColor}
                value={specialInstruction}
                onChangeText={setSpecialInstruction}
                multiline={false}
              />
            </View>
          </>
        )}
      </BottomSheetView>
    </DynamicSheet>
  );
});

export default WaiterInstructionsSheet;

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.HEADLINE,
    textAlign: 'center',
    fontSize: 24,
    marginTop: 4,
    fontFamily: 'Poppins-Medium',
    color: COLORS.darkColor,
    paddingHorizontal: 16,
  },
  description: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 18,
    paddingHorizontal: 26,
  },
  chipsScroll: {
    paddingBottom: 10,
  },
  chipsContainer: {
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accentColor,
    backgroundColor: COLORS.lightColor,
  },
  chipSelected: {
    borderColor: COLORS.primaryColor,
    backgroundColor: `${COLORS.primaryColor}08`,
  },
  chipCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.placeholderColor,
    backgroundColor: COLORS.lightColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCheckboxSelected: {
    backgroundColor: COLORS.primaryColor,
    borderColor: COLORS.primaryColor,
  },
  chipCheckmark: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  chipText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    lineHeight: 16,
    marginTop: 2,
    color: COLORS.placeholderColor,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  chipTextSelected: {
    color: COLORS.primaryColor,
  },
});