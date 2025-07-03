import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon_WishList from '../../../assets/SVG/Icon_Wishlist';
import Icon_Wishlist_Filled from '../../../assets/SVG/Icon_Wishlist_Filled';
import FastImage from 'react-native-fast-image';
import {capitalizeFirstLetter} from '../../helpers';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/NavigationStack';
import {useToggleFavoriteMutation} from '../../api/menuApi';
import {COLORS} from '../../theme';

interface IProps {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  price: number;
  symbol?: string;
  tags: Tags[];
  showNoDetails?: boolean;
  isFavorite: number;
  style?: object;
  onItemPress: (id: number) => void;
}

type ItemListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MenuItem'
>;

const ItemCard = ({
  id,
  name,
  description,
  image_url,
  price,
  symbol,
  tags,
  showNoDetails,
  isFavorite,
  style,
  onItemPress,
}: IProps) => {
  const navigation = useNavigation<ItemListNavigationProp>();
  const [favorite, setFavorite] = useState(false);

  const menu = 'mobile-app-delivery';
  const branch = 'ashrafieh';

  const [toggleFavorite, {isLoading: isTogglingFavorite}] =
    useToggleFavoriteMutation();

  const handleWishList = async () => {
    try {
      setFavorite(prev => !prev);
      await toggleFavorite({itemId: id, menu, branch});
    } catch (error) {
      setFavorite(prev => !prev);
    }
  };

  useEffect(() => {
    setFavorite(isFavorite === 1);
  }, [isFavorite]);

  // const handleWishList = async () => {
  //   setFavorite(prev => !prev);

  //   const response = await POST({
  //     endpoint: `/favorite_items/${id}?menu=mobile-app-delivery&branch=ashrafieh`,
  //   });

  //   console.log('response', response);

  //   if (response.status !== 200) {
  //     setFavorite(prev => !prev);
  //   }
  // };

  return (
    <Pressable onPress={() => onItemPress(id)}>
      <View style={[styles.container, style]}>
        <FastImage
          source={{
            uri:
              image_url ||
              'https://d3vfh4cqgoixck.cloudfront.net/images/locations_placeholder1.webp',
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
          style={styles.image}
        />
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Text style={styles.name} numberOfLines={1}>
              {capitalizeFirstLetter(name)}
            </Text>
            {/* wishlist icon  */}
            {description && !showNoDetails && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}
          </View>

          {!showNoDetails && (
            <Pressable
              onPress={e => {
                e.stopPropagation();
                handleWishList();
              }}
              hitSlop={8}>
              {favorite ? (
                <Icon_Wishlist_Filled style={{marginTop: 8}} />
              ) : (
                <Icon_WishList style={{marginTop: 8}} />
              )}
            </Pressable>
          )}
        </View>

        {!showNoDetails && (
          <Text style={styles.price}>
            {symbol} {price}
          </Text>
        )}
        {/* Tags  */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 4,
            gap: 8,
          }}>
          {tags?.length > 0 &&
            tags?.map((el, idx) => {
              return (
                <View
                  key={idx}
                  style={{
                    backgroundColor: el?.color || '#F2CA4540',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    borderRadius: 8,
                    padding: 8,
                  }}>
                  <FastImage
                    style={{height: 16, width: 16}}
                    source={{
                      uri: el.icon_url,
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />

                  <Text style={{}}>{el.name}</Text>
                </View>
              );
            })}
        </View>
      </View>
    </Pressable>
  );
};

export default ItemCard;

const styles = StyleSheet.create({
  container: {
    width: 220,
  },
  image: {
    width: '100%',
    height: 156,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
  },
  leftContent: {
    flex: 1,
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: COLORS.darkColor,
  },
  description: {
    fontFamily: 'Poppins-Normal',
    fontSize: 12,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: COLORS.secondaryColor,
    marginTop: 4,
  },
});
