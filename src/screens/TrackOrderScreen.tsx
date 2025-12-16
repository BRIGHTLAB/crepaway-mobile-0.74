import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import MapView, { AnimatedRegion, LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch } from 'react-redux';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import Icon_Order_Accepted from '../../assets/SVG/Icon_Order_Accepted';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import { OrderStatusResponse, useGetOrderStatusQuery } from '../api/ordersApi';
import {
  OrdersStackParamList
} from '../navigation/DeliveryTakeawayStack';
import store from '../store/store';
import { COLORS, DRIVER_SOCKET_URL, SCREEN_PADDING } from '../theme';
import SocketService from '../utils/SocketService';

type OrderScreenRouteProps = RouteProp<OrdersStackParamList, 'TrackOrder'>;

const getStatusIcon = (status: Status['key']) => {
  switch (status) {
    case 'confirmed':
      return <Icon_Order_Accepted />;
    case 'on-the-road':
      return <Icon_Motorcycle />;
    default:
      return <Icon_Spine width={29} height={29} color={COLORS.primaryColor} />;
  }
};

// Fake location data
const INITIAL_REGION = {
  latitude: 35.78825,
  longitude: -35.4324,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

const OrderItem = ({
  icon,
  time,
  status,
}: {
  icon: React.ReactNode;
  time: string;
  status: string;
}) => {
  return (
    <View style={styles.orderItem}>
      <View
        style={{
          padding: 10,
          backgroundColor: `${COLORS.primaryColor}20`,
          borderRadius: 100,
        }}>
        {icon}
      </View>
      <View style={{ gap: 2 }}>
        <Text style={{ color: COLORS.foregroundColor, fontSize: 16 }}>
          {time}
        </Text>
        <Text style={{ color: COLORS.darkColor, fontSize: 14 }}>{status}</Text>
      </View>
    </View>
  );
};

const OrderItemSkeleton = () => {
  return (
    <View style={styles.orderItem}>
      <View
        style={{
          width: 49, // Matches icon container width (29 + 20 padding)
          height: 49,
          backgroundColor: '#f0f0f0',
          borderRadius: 100,
        }}
      />
      <View style={{ gap: 2 }}>
        <View
          style={{
            width: 80,
            height: 16,
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 120,
            height: 14,
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
};

const openWhatsApp = async (phoneNumber: string) => {
  try {
    // Remove any non-numeric characters and ensure it starts with country code
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // If the number doesn't start with a country code, you might need to add your default country code
    // For example, if your app is for a specific country, you could prepend the country code here

    const whatsappUrl = `whatsapp://send?phone=${cleanNumber}`;
    const canOpen = await Linking.canOpenURL(whatsappUrl);

    if (canOpen) {
      await Linking.openURL(whatsappUrl);
    } else {
      // Fallback to WhatsApp web if the app is not installed
      const whatsappWebUrl = `https://wa.me/${cleanNumber}`;
      await Linking.openURL(whatsappWebUrl);
    }
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    // You could show an alert to the user here
  }
};

const DriverHeader = ({ driver }: { driver: OrderStatusResponse['driver'] | null | undefined }) => {

  if (!driver) return null;

  return (
    <View style={styles.driverHeader}>
      <View style={styles.driverInfo}>
        {driver.image_url ? (
          <FastImage
            source={{
              uri: driver.image_url,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
            style={styles.driverImage}
          />
        ) : (
          <View
            style={[
              styles.driverImage,
              {
                backgroundColor: COLORS.darkColor,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <Text style={styles.driverImageAltText}>
              {driver.full_name.split(' ').map((str: string) => str.charAt(0)).join('')}
            </Text>
          </View>
        )}
        <View style={styles.driverTextContainer}>
          <Text style={styles.driverName}>{driver.full_name}</Text>
          <Text style={styles.driverDescription}>Is on their way to you</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.callButton}
        onPress={() => {
          if (driver.phone_number) {
            openWhatsApp(driver.phone_number);
          }
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>📞</Text>
        {/* <Icon_Phone width={20} height={20} color={COLORS.darkColor} /> */}
      </TouchableOpacity>
    </View>
  );
};

const TrackOrderScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { orderId, order_type } = useRoute<OrderScreenRouteProps>().params;

  const [region, setRegion] = useState(INITIAL_REGION);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [addressLocation, setAddressLocation] = useState<LatLng | null>(null);
  const [isFitting, setIsFitting] = useState(false);
  const [initialMapLoad, setInitialMapLoad] = useState(true);
  const [hasFittedOnce, setHasFittedOnce] = useState(false);
  const userState = store.getState().user;
  const mapRef = useRef<MapView>(null);

  // AnimatedRegion ref for smooth driver movement (prevents remount flicker)
  const driverRegionRef = useRef<any>(
    new AnimatedRegion({
      latitude: INITIAL_REGION.latitude,
      longitude: INITIAL_REGION.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  );

  // Debounce timer ref for driver location updates
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isTakeaway = order_type === 'takeaway';
  console.log('isTakeaway', isTakeaway);
  console.log('userState.orderType', userState.orderType);
  console.log('order_type', order_type);

  const { data: orderStatus, isLoading } = useGetOrderStatusQuery(orderId, {
    pollingInterval: 2000,
  });

  // Debounced function to update driver location
  const updateDriverLocation = useCallback((coordinates: { lat: number; long: number }) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to update location after 500ms of no new updates
    debounceTimerRef.current = setTimeout(() => {
      setDriverLocation({
        latitude: coordinates.lat,
        longitude: coordinates.long,
      });
      console.log('newDriverLocation', {
        latitude: coordinates.lat,
        longitude: coordinates.long,
      });
    }, 1000);
  }, []);

  // Animate AnimatedRegion when driverLocation changes (smooth movement, prevents flicker)
  useEffect(() => {
    if (!driverLocation || !driverRegionRef.current) return;

    try {
      if (driverRegionRef.current.timing) {
        driverRegionRef.current.timing({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          duration: 600,
          useNativeDriver: false,
        }).start();
      } else if (driverRegionRef.current.setValue) {
        driverRegionRef.current.setValue({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
        });
      }
    } catch (e) {
      console.warn('AnimatedRegion update failed', e);
    }
  }, [driverLocation]);

  // Memoize orderStatus to prevent unnecessary re-renders when data hasn't changed
  const memoizedOrderStatus = useMemo(() => {
    return orderStatus;
  }, [orderStatus?.status_history, orderStatus?.estimated_delivery_time, orderStatus?.driver]);

  // This effect will run when address coordinates change
  useEffect(() => {
    // Only proceed if we have valid coordinates
    if (
      userState.addressLatitude != null &&
      userState.addressLongitude != null
    ) {
      // Create the new location
      const newAddressLocation = {
        latitude: Number(userState.addressLatitude),
        longitude: Number(userState.addressLongitude),
      };

      // Update address location state
      setAddressLocation(newAddressLocation);

      // Also update region with the new coordinates
      const newRegion = {
        latitude: Number(userState.addressLatitude),
        longitude: Number(userState.addressLongitude),
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      };

      // If the map is already loaded, animate to the new region
      if (mapRef.current && !initialMapLoad) {
        mapRef.current.animateToRegion(newRegion, 1000);
      } else {
        // First load, just set the region state
        setRegion(newRegion);
      }
    }
  }, [userState.addressLatitude, userState.addressLongitude, initialMapLoad]);

  useEffect(() => {
    if (order_type === 'delivery') {
      const socketInstance = SocketService.getInstance();

      socketInstance.connect(DRIVER_SOCKET_URL, {
        auth: userState.jwt || '',
      });

      console.log('info', {
        id: userState.id,
        orderId: orderId.toString(),
      });
      socketInstance.emit('message', {
        type: 'userJoin',
        data: {
          user: {
            id: userState.id,
          },
          order_obj: {
            id: orderId.toString(),
            items: [],
          },
        },
      });

      // Subscribe to location updates
      socketInstance.on('onLocationUpdate', coordinates => {
        if (coordinates && coordinates.lat && coordinates.long) {
          updateDriverLocation(coordinates);
        }
      });

      return () => {
        socketInstance.disconnect();
        // Clear debounce timer on cleanup
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [orderId, updateDriverLocation]);


  // zoom out so we can see both the driver and address at the same time
  useEffect(() => {
    // Only run this when both locations are available and we haven't fitted once yet
    if (mapRef.current && driverLocation && addressLocation && !hasFittedOnce) {
      console.log('We are fitting the coordinates for the first time');

      // Set fitting flag to prevent region updates
      setIsFitting(true);
      setHasFittedOnce(true);

      setTimeout(() => {
        mapRef.current?.fitToCoordinates([driverLocation, addressLocation], {
          edgePadding: { top: 50, right: 50, bottom: 450, left: 50 },
          animated: true,
        });

        // After animation completes, reset the flag
        setTimeout(() => {
          setIsFitting(false);
        }, 1000); // Animation usually takes about 500ms, so wait a bit longer
      }, 500);
    }
  }, [driverLocation, addressLocation, hasFittedOnce]);

  // Memoize driver marker to prevent unnecessary re-renders
  const driverMarker = useMemo(() => {
    const coordinate = driverRegionRef.current;
    if (!coordinate || !driverLocation) return null;

    return (
      <Marker.Animated
        coordinate={coordinate}
        title="Driver Location"
        tracksViewChanges={false}
      >
        <View style={styles.driverMarker}>
          <Icon_Motorcycle width={20} height={20} />
        </View>
      </Marker.Animated>
    );
  }, [driverLocation]);


  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          region={region} // Use region instead of initialRegion
          style={[styles.map, isTakeaway && { opacity: 0.9 }]}
          onMapReady={() => setInitialMapLoad(false)}
        // onRegionChangeComplete={newRegion => {
        //   // Only update region if not currently fitting coordinates
        //   if (!isFitting) {
        //     setRegion(newRegion);
        //   }
        // }}
        >
          {/* User Marker */}
          {addressLocation && (
            <Marker coordinate={addressLocation} title="Your Location" tracksViewChanges={false}
              identifier='user-marker'
            >
              <View style={styles.userMarker}>
                <Text style={styles.markerText}>You</Text>
              </View>
            </Marker>
          )}

          {/* Driver Marker */}
          {driverMarker}
        </MapView>

        {isTakeaway && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1,
            }}
          />
        )}
      </View>

      <View style={styles.orderContainer}>
        {isLoading ? (
          <>
            <OrderItemSkeleton />
            <OrderItemSkeleton />
            <OrderItemSkeleton />
          </>
        ) : (
          <FlatList
            data={memoizedOrderStatus?.status_history}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <OrderItem
                icon={getStatusIcon(item.key)}
                time={dayjs(item.date).format('hh:mm A')}
                status={item.name}
              />
            )}
            ListHeaderComponent={
              <DriverHeader driver={memoizedOrderStatus?.driver} />
            }
            ListFooterComponent={
              <Text
                style={{
                  marginTop: 12,
                }}>
                Estimated {order_type === 'delivery' ? 'arrival' : 'preparation time'}: {memoizedOrderStatus?.estimated_delivery_time} min
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
};

export default TrackOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingVertical: 10,
    margin: 0,
    padding: 0,
    backgroundColor: 'red',
  },
  mapContainer: {
    top: -10,
    position: 'relative',
    flex: 1
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  orderContainer: {
    position: 'absolute',
    bottom: 35,
    right: 16,
    left: 16,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 20,
    zIndex: 2,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  userMarker: {
    backgroundColor: COLORS.primaryColor,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  driverMarker: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primaryColor,
  },
  markerText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  driverImageAltText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverTextContainer: {
    gap: 2,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.foregroundColor,
  },
  driverDescription: {
    fontSize: 12,
    color: COLORS.darkColor,
    opacity: 0.7,
  },
  callButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${COLORS.primaryColor}20`,
  },
});
