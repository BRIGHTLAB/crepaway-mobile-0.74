import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, {useCallback, useEffect, useState, useLayoutEffect, useRef} from 'react';
import Input from '../components/UI/Input';
import Icon_Search from '../../assets/SVG/Icon_Search';
import {COLORS, SCREEN_PADDING, TYPOGRAPHY} from '../theme';
import {FlatList} from 'react-native-gesture-handler';
import {useGetAllergensQuery} from '../api/dataApi';
import {debounce} from 'lodash';
import {useUpdateAllergensMutation} from '../api/userApi';
import Checkbox from '../components/UI/Checkbox';
import {useNavigation} from '@react-navigation/native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Toast from 'react-native-toast-message';

const AllergiesScreen = () => {
  const navigation = useNavigation();
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceValue, setSearchDebounceValue] = useState('');
  const {data, isLoading, isFetching} = useGetAllergensQuery({
    search: searchDebounceValue,
  });

  const [updateAllergens, {isLoading: updateAllergensLoading}] =
    useUpdateAllergensMutation();

  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const currentSearchRef = useRef<string>('');

  useEffect(() => {
    if (searchDebounceValue !== currentSearchRef.current) {
      setAllergens([]);
      currentSearchRef.current = searchDebounceValue;
    }
  }, [searchDebounceValue]);

  useEffect(() => {
    if (!data) return;
    if (!isFetching) {
      setAllergens(data);
    }
  }, [data, isFetching]);

  // Set up the save button in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSaveAllergens}
          disabled={updateAllergensLoading || !hasChanges}
          style={{
            paddingHorizontal: 16,
            opacity: updateAllergensLoading || !hasChanges ? 0.5 : 1,
          }}>
          <Text
            style={{
              ...TYPOGRAPHY.SUB_HEADLINE,
              color: COLORS.primaryColor,
            }}>
            {updateAllergensLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, updateAllergensLoading, hasChanges, allergens]);

  const handleChangeSearch = (value: string) => {
    setSearchValue(value);
    handleSearchDebounce(value);
  };

  const handleSearchDebounce = useCallback(
    debounce(async (value: string) => {
      setSearchDebounceValue(value);
    }, 1500),
    [],
  );

  const handleAllergenPress = (id: number) => {
    setAllergens(prev =>
      prev.map(al =>
        al.id === id ? {...al, has_allergy: al.has_allergy ? 0 : 1} : al,
      ),
    );
    setHasChanges(true);
  };

  const handleSaveAllergens = async () => {
    try {
      // Extract only the necessary data for the API call
      const allergenData = allergens
        .filter(item => item.has_allergy)
        .map(al => ({id: al.id}));

      await updateAllergens(allergenData);
      setHasChanges(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
      Toast.show({
        type: 'success',
        text1: 'Allergens updated successfully',
        visibilityTime: 2000,
        position: 'bottom',
      });
    } catch (error) {
      console.error('Failed to update allergens:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update allergens',
        visibilityTime: 2000,
        position: 'bottom',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Input
          placeholder="Search allergens..."
          iconLeft={<Icon_Search />}
          value={searchValue}
          onChangeText={val => handleChangeSearch(val)}
        />
        <Text style={styles.description}>
          Select any allergens you need to avoid. We'll let you know if any of the menu items you're interested in contain these allergens.
        </Text>
      </View>

      <View style={styles.contentSection}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Allergens</Text>
          {allergens.length > 0 && (
            <Text style={styles.countText}>
              {allergens.filter(a => a.has_allergy).length} selected
            </Text>
          )}
        </View>
        {isLoading || isFetching ? (
          <View style={styles.skeletonContainer}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.skeletonWrapper}>
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    alignItems="center"
                    gap={12}
                    padding={16}
                    borderRadius={12}>
                    <SkeletonPlaceholder.Item width={24} height={24} borderRadius={4} />
                    <SkeletonPlaceholder.Item
                      width={index % 2 === 0 ? '70%' : '60%'}
                      height={18}
                      borderRadius={4}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              </View>
            ))}
          </View>
        ) : allergens.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchValue ? 'No allergens found' : 'No allergens available'}
            </Text>
            {searchValue && (
              <Text style={styles.emptyStateSubtext}>
                Try searching with a different term
              </Text>
            )}
          </View>
        ) : (
          <FlatList
            data={allergens}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({item}) => {
              const isSelected = !!item.has_allergy;
              return (
                <TouchableOpacity
                  style={[
                    styles.allergenCard,
                    isSelected ? styles.allergenCardSelected : null,
                  ]}
                  onPress={() => handleAllergenPress(item.id)}
                  activeOpacity={0.7}>
                  <Checkbox
                    checked={isSelected}
                    onCheck={() => handleAllergenPress(item.id)}
                  />
                  <Text
                    style={[
                      styles.allergenName,
                      isSelected ? styles.allergenNameSelected : null,
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
};

export default AllergiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundColor,
  },
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: SCREEN_PADDING.vertical,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderColor,
  },
  description: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
    marginTop: 12,
    lineHeight: 20,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.darkColor,
    fontWeight: '700',
    fontSize: 20,
  },
  countText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.primaryColor,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  allergenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderColor,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 0.1,
    elevation: 2,
  },
  allergenCardSelected: {
    backgroundColor: COLORS.lightColor,
    borderColor: COLORS.primaryColor,
    // borderWidth: 2,
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  allergenName: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.darkColor,
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  allergenNameSelected: {
    color: COLORS.primaryColor,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    // justifyContent: 'center
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...TYPOGRAPHY.SUB_HEADLINE,
    color: COLORS.foregroundColor,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.foregroundColor,
    textAlign: 'center',
    opacity: 0.7,
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
});
