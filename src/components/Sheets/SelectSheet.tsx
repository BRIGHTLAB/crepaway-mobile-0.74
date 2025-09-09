import BottomSheet, {
  BottomSheetFlatList
} from '@gorhom/bottom-sheet';
import React, { forwardRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Icon_BackArrow from '../../../assets/SVG/Icon_BackArrow';
import { COLORS, TYPOGRAPHY } from '../../theme';
import DynamicSheet from './DynamicSheet';

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
  showBackButton?: boolean;
  onBackPress?: () => void;
};

const SelectSheet = forwardRef<BottomSheet, SelectSheetProps>(
  ({ value, options, onChange, title, loading = false, showBackButton = false, onBackPress }, ref) => {
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
        <View style={styles.headerContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Icon_BackArrow />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, showBackButton && styles.titleWithBack]}>{title}</Text>
        </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    ...TYPOGRAPHY.TITLE,
    color: COLORS.black,
  },
  titleWithBack: {
    flex: 1,
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
