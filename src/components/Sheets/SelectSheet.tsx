import React, { forwardRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DynamicSheet from './DynamicSheet';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { COLORS, TYPOGRAPHY } from '../../theme';
import { FlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Option = {
  label: string;
  value: number;
};

type SelectSheetProps = {
  value?: number | null;
  options: Option[];
  onChange: (value: number | null) => void;
  title: string;
  loading?: boolean;
};

const SelectSheet = forwardRef<BottomSheet, SelectSheetProps>(
  ({ value, options, onChange, title, loading = false }, ref) => {
    // const handleOptionSelect = (option: Option) => {
    //   onChange(option.value);
    //   // Use the forwarded ref to close the sheet
    //   if (ref && typeof ref !== 'function' && ref.current) {
    //     ref.current.close();
    //   }
    // };
    const { bottom } = useSafeAreaInsets();
    const renderOption = ({ item }: { item: Option }) => (
      <TouchableOpacity
        style={[
          styles.optionItem,
          value === item.value && styles.selectedOption,
        ]}
        onPress={() => onChange(item.value)}>
        <Text
          style={[
            styles.optionText,
            value === item.value && styles.selectedOptionText,
          ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );

    // Generate skeleton placeholders for loading state
    const loadingItems = Array(5).fill({ label: '', value: '' });

    const renderSkeletonItem = () => (
      <SkeletonPlaceholder>
        <View style={styles.skeletonOption} />
      </SkeletonPlaceholder>
    );

    return (
      <DynamicSheet ref={ref} snapPoints={['70%']}>
        <Text style={styles.title}>{title}</Text>
        {loading ? (
          <View style={styles.listContainer}>
            {loadingItems.map((_, index) => (
              <View key={index} style={{ marginBottom: 8 }}>
                {renderSkeletonItem()}
              </View>
            ))}
          </View>
        ) : (
          <BottomSheetFlatList
            data={options}
            keyExtractor={item => item.value.toString()}
            renderItem={renderOption}
            contentContainerStyle={[styles.listContainer, {
              paddingBottom: bottom + 10
            }]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </DynamicSheet>
    );
  },
);

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.black,
    marginBottom: 16,
  },
  listContainer: {
    paddingTop: 16,
    gap: 8,
  },
  optionItem: {
    padding: 16,
    backgroundColor: '#BABABA26',
    borderColor: COLORS.borderColor,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: COLORS.black,
  },
  optionText: {
    color: COLORS.black,
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  skeletonOption: {
    height: 48,
    borderRadius: 8,
  },
});

export default SelectSheet;
