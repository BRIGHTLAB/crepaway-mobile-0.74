import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useState, useLayoutEffect} from 'react';
import Input from '../components/UI/Input';
import Icon_Search from '../../assets/SVG/Icon_Search';
import {COLORS, SCREEN_PADDING, TYPOGRAPHY} from '../theme';
import {FlatList} from 'react-native-gesture-handler';
import {useGetAllergensQuery} from '../api/dataApi';
import {debounce} from 'lodash';
import RadioButton from '../components/UI/RadioButton';
import {useUpdateAllergensMutation} from '../api/userApi';
import Checkbox from '../components/UI/Checkbox';
import {useNavigation} from '@react-navigation/native';

const AllergiesScreen = () => {
  const navigation = useNavigation();
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounceValue, setSearchDebounceValue] = useState('');
  const {data, isLoading} = useGetAllergensQuery({
    search: searchDebounceValue,
  });

  const [updateAllergens, {isLoading: updateAllergensLoading}] =
    useUpdateAllergensMutation();

  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!data) return;
    setAllergens(data);
  }, [data]);

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
      // You could add a success message here
    } catch (error) {
      console.error('Failed to update allergens:', error);
      // You could add error handling here
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: COLORS.white,
          paddingHorizontal: SCREEN_PADDING.horizontal,
          paddingVertical: SCREEN_PADDING.vertical,
        }}>
        <Input
          placeholder="Search"
          iconLeft={<Icon_Search />}
          value={searchValue}
          onChangeText={val => handleChangeSearch(val)}
        />
      </View>

      <View
        style={{
          gap: 16,
          backgroundColor: COLORS.white,
          paddingVertical: 32,
          paddingHorizontal: SCREEN_PADDING.horizontal,
        }}>
        <Text
          style={{
            ...TYPOGRAPHY.SUB_HEADLINE,
            color: COLORS.darkColor,
          }}>
          Allergens
        </Text>
        {isLoading ? (
          <ActivityIndicator size={'large'} color={COLORS.primaryColor} />
        ) : (
          <FlatList
            data={allergens}
            ItemSeparatorComponent={() => <View style={{height: 16}} />}
            renderItem={({item}) => (
              <View style={{flexDirection: 'row', gap: 8}}>
                <Checkbox
                  checked={!!item.has_allergy}
                  onCheck={() => handleAllergenPress(item.id)}
                />
                <Text
                  style={{
                    ...TYPOGRAPHY.BODY,
                    color: COLORS.darkColor,
                  }}>
                  {item.name}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default AllergiesScreen;

const styles = StyleSheet.create({
  container: {
    gap: 24,
    flex: 1,
  },
});
