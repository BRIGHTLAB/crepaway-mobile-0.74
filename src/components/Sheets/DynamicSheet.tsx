import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooterProps
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { Keyboard, StyleSheet as RNStyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';

import { COLORS, SCREEN_PADDING } from '../../theme';

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
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
      contentContainerStyle,
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
    const lastIndexRef = useRef<number>(-1);
    const isNavigatingRef = useRef<boolean>(false);
    const isClosingRef = useRef<boolean>(false);
    const isFocused = useIsFocused();

    const backgroundStyle = useMemo(
      () => ({ backgroundColor: COLORS.white }),
      [],
    );
    const handleIndicatorStyle = useMemo(
      () => ({ backgroundColor: COLORS.borderColor }),
      [],
    );

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

    // Navigation override — only active while the sheet is open
    // Prevents a chain of wrappers from all simultaneously-mounted sheets
    const originalNavigateRef = useRef<any>(null);

    const installNavigationOverride = useCallback(() => {
      if (!navigation || originalNavigateRef.current) return;

      originalNavigateRef.current = navigation.navigate;

      navigation.navigate = function () {
        const args = arguments;

        if (ref && typeof ref !== 'function' && ref.current) {
          Keyboard.dismiss();
          isNavigatingRef.current = true;
          lastIndexRef.current = -1;
          ref.current.close();

          if (onClose) onClose();

          setTimeout(() => {
            (originalNavigateRef.current as (...a: any[]) => any).apply(
              navigation as any,
              args as any
            );
            setTimeout(() => {
              isNavigatingRef.current = false;
            }, 200);
          }, 100);
        } else {
          (originalNavigateRef.current as (...a: any[]) => any).apply(
            navigation as any,
            args as any
          );
        }
      };
    }, [navigation, ref, onClose]);

    const uninstallNavigationOverride = useCallback(() => {
      if (!navigation || !originalNavigateRef.current) return;
      navigation.navigate = originalNavigateRef.current;
      originalNavigateRef.current = null;
    }, [navigation]);

    // Fires at the START of an animation, before the sheet moves.
    // Used to mark closing intent so the keyboardDidHide listener
    // doesn't race ahead of handleSheetChanges and reopen the sheet.
    const handleAnimate = useCallback(
      (_fromIndex: number, toIndex: number) => {
        if (toIndex === -1) {
          isClosingRef.current = true;
        }
      },
      [],
    );

    // Handle sheet index changes (fires when animation completes)
    const handleSheetChanges = useCallback(
      (index: number) => {
        // Sheet just opened — install navigation override
        if (lastIndexRef.current === -1 && index >= 0) {
          isClosingRef.current = false;
          installNavigationOverride();
        }

        if (lastIndexRef.current >= 0 && index === -1) {
          isClosingRef.current = false;
          Keyboard.dismiss();
          uninstallNavigationOverride();

          if (onClose) {
            onClose();
          }
        }
        lastIndexRef.current = index;

        if (onChange) {
          onChange(index);
        }
      },
      [onClose, onChange, installNavigationOverride, uninstallNavigationOverride],
    );

    const { isVisible } = useKeyboardState();

    // Track isFocused in a ref so the keyboard listener doesn't re-subscribe
    const isFocusedRef = useRef(isFocused);
    isFocusedRef.current = isFocused;

    // Handle keyboard hide behavior
    useEffect(() => {
      const keyboardListener = Keyboard.addListener("keyboardDidHide", () => {
        if (
          lastIndexRef.current >= 0 &&
          !isNavigatingRef.current &&
          !isClosingRef.current &&
          isFocusedRef.current &&
          ref &&
          typeof ref !== 'function' &&
          ref.current
        ) {
          (ref as React.RefObject<BottomSheet>).current?.snapToIndex(0);
        }
      });

      return () => {
        keyboardListener.remove();
      };
    }, [ref]);

    // Cleanup navigation override on unmount
    useEffect(() => {
      return () => {
        uninstallNavigationOverride();
      };
    }, [uninstallNavigationOverride]);
    return (
      <Portal>
        <BottomSheet
          ref={ref}
          backdropComponent={renderBackdrop}
          topInset={50}
          index={-1}
          snapPoints={snapPoints?.length ? snapPoints : undefined}
          enableContentPanningGesture={!disableCollapse}
          enableDynamicSizing={!snapPoints}
          maxDynamicContentSize={maxDynamicContentSize}
          enablePanDownToClose={!disableCollapse && !isVisible}
          enableHandlePanningGesture={!disableCollapse}
          footerComponent={footerComponent}
          onAnimate={handleAnimate}
          onChange={handleSheetChanges}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          // enableBlurKeyboardOnGesture
          // android_keyboardInputMode="adjustResize"
          android_keyboardInputMode="adjustPan"
          backgroundStyle={backgroundStyle}
          handleIndicatorStyle={handleIndicatorStyle}
          style={[staticStyles.contentContainer, contentContainerStyle]}>
          {children}
        </BottomSheet>
      </Portal>
    );
  },
);

export default DynamicSheet;

const staticStyles = RNStyleSheet.create({
  contentContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
});
