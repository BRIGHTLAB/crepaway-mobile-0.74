import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS, TYPOGRAPHY } from '../../../theme';
import Button from '../../UI/Button';
import DynamicSheet from '../DynamicSheet';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { TableUser } from '../../../screens/TableScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Action = {
  id: number;
  text: string;
  key: string;
};

type Props = {
  user: TableUser;
  actions: Action[];
  onSelectAction: (action: Action) => void;
  sheetRef: React.RefObject<BottomSheet | null>;
};

const KingActionsSheet = ({ user, actions, onSelectAction, sheetRef }: Props) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <DynamicSheet ref={sheetRef}>
      <BottomSheetView style={[styles.userSheetContainer, { paddingBottom: 10 + bottom }]}>
        <View style={styles.userProfile}>
          <FastImage
            style={styles.userSheetImage}
            source={{
              uri: user.image_url || 'https://placehold.co/200x200/png',
            }}
          />
          <Text style={styles.userSheetName}>{user.name}</Text>
        </View>
        <View style={styles.actionsContainer}>
          {actions.map(instruction => (
            <TouchableOpacity
              key={instruction.id}
              style={styles.instructionItem}
              onPress={() => onSelectAction(instruction)}>
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

export default KingActionsSheet;

const styles = StyleSheet.create({
  userSheetContainer: {
    paddingHorizontal: 16,
    gap: 20,
  },
  userSheetTitle: {
    ...TYPOGRAPHY.HEADLINE,
    textAlign: 'center',
    marginBottom: 8,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userSheetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userSheetName: {
    ...TYPOGRAPHY.BODY,
    fontWeight: 'bold',
  },
  actionsContainer: {
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
