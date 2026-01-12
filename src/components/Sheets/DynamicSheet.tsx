import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooterProps
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { useNavigation } from '@react-navigation/native';
import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_PADDING } from '../../theme';

type Props = {
  children: React.ReactNode;
  snapPoints?: string[];
  maxDynamicContentSize?: number;
  disableCollapse?: boolean;
  footerComponent?: React.FC<BottomSheetFooterProps>;
  onClose?: () => void;
  onChange?: (index: number) => void;
};

const DynamicSheet = forwardRef<BottomSheet, Props>(
  (
    {
      children,
      snapPoints,
      maxDynamicContentSize = 800,
      disableCollapse = false,
      onClose,
      onChange,
      footerComponent,
    }: Props,
    ref,
  ) => {
    const navigation = useNavigation();
    const lastIndexRef = useRef(0);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) =>
        disableCollapse ? null : (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior={disableCollapse ? 'none' : 'close'}
          />
        ),
      [disableCollapse],
    );

    // Handle sheet index changes
    const handleSheetChanges = useCallback(
      (index: number) => {
        if (lastIndexRef.current >= 0 && index === -1) {
          Keyboard.dismiss();

          if (onClose) {
            onClose();
          }
        }
        lastIndexRef.current = index;

        // Call onChange callback if provided
        if (onChange) {
          onChange(index);
        }
      },
      [onClose, onChange],
    );

    const { bottom, top } = useSafeAreaInsets();


    // TODO check for a better approach as this one overrides the navigation to cause a delay0
    useEffect(() => {
      if (!navigation) return;

      const originalNavigate = navigation.navigate;

      navigation.navigate = function () {
        const args = arguments;

        if (ref && typeof ref !== 'function' && ref.current) {
          Keyboard.dismiss();

          ref.current.close();

          if (onClose) onClose();

          // Navigate after delay
          // @ts-expect-error
          setTimeout(() => originalNavigate.apply(navigation, args), 100);
        } else {
          // Navigate immediately if no sheet
          // @ts-expect-error
          originalNavigate.apply(navigation, args);
        }
      };

      return () => {
        navigation.navigate = originalNavigate;
      };
    }, [navigation, ref, onClose]);

    return (
      <Portal>
        <BottomSheet
          ref={ref}
          backdropComponent={renderBackdrop}
          index={-1}
          {...(snapPoints && snapPoints.length > 0 ? { snapPoints } : {})}
          enableContentPanningGesture={!disableCollapse}
          enableDynamicSizing={!snapPoints}
          maxDynamicContentSize={maxDynamicContentSize}
          enablePanDownToClose={!disableCollapse}
          enableHandlePanningGesture={!disableCollapse}
          footerComponent={footerComponent}
          onChange={handleSheetChanges}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"

          style={styles.contentContainer}>
          {children}
        </BottomSheet>
      </Portal>
    );
  },
);

export default DynamicSheet;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
});
