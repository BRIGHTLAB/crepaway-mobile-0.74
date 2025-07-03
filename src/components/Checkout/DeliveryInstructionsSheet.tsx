import { Keyboard, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { GET } from '../../api';
import DynamicSheet from '../Sheets/DynamicSheet';
import Checkbox from '../UI/Checkbox';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Icon_Motorcycle from '../../../assets/SVG/Icon_Motorcycle';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { COLORS } from '../../theme';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetInput from '../UI/BottomSheetInput';

interface SelectedInstruction {
  id: number;
  title: string;
}

export interface DeliveryInstructions {
  id: number;
  order: number;
  title: string;
  created_at: string;
  updated_at: string;
}

const DeliveryInstructionsSheet = ({
  deliveryInstructionRef,
  onAddInstructions,
}: {
  deliveryInstructionRef: React.RefObject<BottomSheetMethods | null>;
  onAddInstructions?: (
    instructions: SelectedInstruction[],
    specialNotes: string,
  ) => void;
}) => {
  const [data, setData] = useState<DeliveryInstructions[]>([]);
  const [selectedInstructions, setSelectedInstructions] = useState<
    SelectedInstruction[]
  >([]);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const fetchDeliveryInstructions = async () => {
    const response = await GET<DeliveryInstructions[]>({
      endpoint: '/delivery_instructions',
    });

    if (response?.data) {
      setData(response?.data);
    }
  };

  const handleAddInstructions = () => {
    if (onAddInstructions) {
      onAddInstructions(selectedInstructions, specialNotes);
    }
    deliveryInstructionRef.current?.close();
  };

  useEffect(() => {
    fetchDeliveryInstructions();
  }, []);

  const handleCheckboxToggle = (
    id: number,
    title: string,
    isChecked: boolean,
  ) => {
    if (isChecked) {
      setSelectedInstructions(prev => [...prev, { id, title }]);
    } else {
      setSelectedInstructions(prev => prev.filter(item => item.id !== id));
    }
  };

  console.log('selectedInstructions', selectedInstructions);
  const { bottom } = useSafeAreaInsets();
  return (
    <DynamicSheet ref={deliveryInstructionRef}>
      <BottomSheetView
        style={{ gap: 12, paddingBottom: 10 + bottom }}
        onTouchStart={() => Keyboard.dismiss()}>
        <Text
          style={{
            color: COLORS.darkColor,
            fontFamily: 'Poppins-Medium',
            fontSize: 24,
          }}>
          Add Delivery Instruction
        </Text>

        <View
          style={{
            gap: 12,
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
          }}>
          {data?.length > 0 &&
            data?.map((el, idx) => {
              const isChecked = selectedInstructions.some(
                item => item.id === el.id,
              );
              return (
                <Checkbox
                  key={idx}
                  checked={isChecked}
                  title={el?.title}
                  onCheck={() =>
                    handleCheckboxToggle(el.id, el?.title, !isChecked)
                  }
                />
              );
            })}
        </View>

        <View style={{ marginVertical: 6 }}>
          <BottomSheetInput
            placeholder="Any special notes or requests?"
            value={specialNotes}
            onChangeText={setSpecialNotes}
            blurOnSubmit
          />
        </View>

        <Button
          style={{}}
          icon={<Icon_Motorcycle color={'#FFF'} />}
          onPress={handleAddInstructions}>
          Add Instructions
        </Button>
      </BottomSheetView>
    </DynamicSheet>
  );
};

export default DeliveryInstructionsSheet;

const styles = StyleSheet.create({});
