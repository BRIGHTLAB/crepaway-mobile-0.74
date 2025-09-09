import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import MapView, { LatLng, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import Icon_Order_Accepted from '../../assets/SVG/Icon_Order_Accepted';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import { useGetOrderStatusQuery } from '../api/ordersApi';
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

const TrackOrderScreen = () => {
  const navigation = useNavigation();
  const { orderId, order_type } = useRoute<OrderScreenRouteProps>().params;

  const [region, setRegion] = useState(INITIAL_REGION);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [addressLocation, setAddressLocation] = useState<LatLng | null>(null);
  const [isFitting, setIsFitting] = useState(false);
  const [initialMapLoad, setInitialMapLoad] = useState(true);
  const [hasFittedOnce, setHasFittedOnce] = useState(false);
  const userState = store.getState().user;
  const mapRef = useRef<MapView>(null);

  const isTakeaway = order_type
    ? order_type === 'takeaway'
    : userState.orderType === 'takeaway';

  const { data: orderStatus, isLoading } = useGetOrderStatusQuery(orderId, {
    pollingInterval: 2000,
  });

  // Memoize orderStatus to prevent unnecessary re-renders when data hasn't changed
  const memoizedOrderStatus = useMemo(() => {
    return orderStatus;
  }, [orderStatus?.status_history, orderStatus?.estimated_delivery_time]);

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
    if (userState.orderType === 'delivery') {
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
          setDriverLocation({
            latitude: coordinates.lat,
            longitude: coordinates.long,
          });
          console.log('newDriverLocation', {
            latitude: coordinates.lat,
            longitude: coordinates.long,
          });
        }
      });

      return () => socketInstance.disconnect();
    }
  }, [orderId]);


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
            <Marker coordinate={addressLocation} title="Your Location">
              <View style={styles.userMarker}>
                <Text style={styles.markerText}>You</Text>
              </View>
            </Marker>
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <Marker coordinate={driverLocation} title="Driver Location">
              <View style={styles.driverMarker}>
                <Icon_Motorcycle width={20} height={20} />
              </View>
            </Marker>
          )}
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
            renderItem={({ item }) => (
              <OrderItem
                icon={getStatusIcon(item.key)}
                time={dayjs(item.date).format('hh:mm A')}
                status={item.name}
              />
            )}
            ListFooterComponent={
              <Text
                style={{
                  marginTop: 12,
                }}>
                Estimated {userState.orderType === 'delivery' ? 'arrival' : 'preparation time'}: {memoizedOrderStatus?.estimated_delivery_time} min
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
});
