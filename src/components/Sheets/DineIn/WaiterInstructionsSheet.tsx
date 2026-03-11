import BottomSheet from '@gorhom/bottom-sheet';
import React, { forwardRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon_Bell from '../../../../assets/SVG/Icon_Bell';
import { useGetWaiterInstructionsQuery } from '../../../api/dataApi';
import { TableWaiter } from '../../../screens/TableScreen';
import { COLORS, TYPOGRAPHY } from '../../../theme';
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

  return (
    <DynamicSheet ref={ref} snapPoints={['45%']} contentStyle={{ paddingHorizontal: 0 }}>
      {isLoading ? (
        <ActivityIndicator size={20} />
      ) : (
        <View style={styles.container}>
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
          <TextInput
            style={styles.specialInput}
            placeholder="Special Instruction"
            placeholderTextColor={COLORS.foregroundColor}
            value={specialInstruction}
            onChangeText={setSpecialInstruction}
            multiline={false}
          />

          {/* Send Request button */}
          <View style={styles.buttonWrapper}>
            <Button
              variant="primary"
              onPress={handleSendRequest}
              icon={<Icon_Bell width={16} height={14} color={COLORS.white} />}
            >
              Send Request
            </Button>
          </View>
        </View>
      )}
    </DynamicSheet>
  );
});

export default WaiterInstructionsSheet;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    gap: 10,
  },
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
  specialInput: {
    borderWidth: 1,
    borderColor: COLORS.accentColor,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.darkColor,
    backgroundColor: COLORS.lightColor,
    marginHorizontal: 16,
  },
  buttonWrapper: {
    paddingHorizontal: 16,
    marginTop: 5,
  },
  scrollTrack: {
    height: 4,
    backgroundColor: COLORS.lightColor,
    borderRadius: 2,
    marginTop: 10,
  },
  scrollThumb: {
    height: 4,
    backgroundColor: COLORS.foregroundColor,
    borderRadius: 2,
  },
});