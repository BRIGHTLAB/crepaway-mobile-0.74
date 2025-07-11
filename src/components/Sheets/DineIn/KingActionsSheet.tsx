import React, { forwardRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { COLORS, TYPOGRAPHY, SCREEN_PADDING } from '../../../theme';
import Button from '../../UI/Button';
import DynamicSheet from '../DynamicSheet';
import BottomSheet, { BottomSheetScrollView, BottomSheetView, BottomSheetFooter, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { TableUser } from '../../../screens/TableScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

export type Action = {
  id: number;
  text: string;
  key: string;
};

type Props = {
  user: TableUser | null;
  actions: Action[];
  onSelectAction: (action: Action) => void;
};

const KingActionsSheet = forwardRef<BottomSheet, Props>(
  ({ actions, onSelectAction, user }, ref) => {

    if (!user) return <></>

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
      <DynamicSheet ref={ref} footerComponent={Footer} snapPoints={['50%']}>
        <View style={styles.userProfile}>
          <FastImage
            style={styles.userSheetImage}
            source={{
              uri: user.image_url || 'https://placehold.co/200x200/png',
            }}
          />
          <Text style={styles.userSheetName}>{user.name}</Text>
        </View>
        <View
          style={{
            paddingBottom: 170,
          }}
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.actionsContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.id + index}
                style={styles.instructionItem}
                onPress={() => onSelectAction(action)}>
                <Text style={styles.instructionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        </View>
      </DynamicSheet>
    );
  }
)

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
    paddingTop: 18,
    gap: 12,
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