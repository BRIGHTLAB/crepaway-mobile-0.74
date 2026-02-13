import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import MapView, {
  AnimatedRegion,
  LatLng,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { useDispatch } from 'react-redux';
import Icon_Branch from '../../assets/SVG/Icon_Branch';
import Icon_Motorcycle from '../../assets/SVG/Icon_Motorcycle';
import Icon_Order_Accepted from '../../assets/SVG/Icon_Order_Accepted';
import Icon_Spine from '../../assets/SVG/Icon_Spine';
import {
  ordersApi,
  OrderStatusResponse,
  useGetOrderQuery,
  useGetOrderStatusQuery,
} from '../api/ordersApi';
import { OrdersStackParamList } from '../navigation/DeliveryTakeawayStack';
import store from '../store/store';
import { COLORS, DRIVER_SOCKET_URL, SCREEN_PADDING } from '../theme';
import { formatNumberWithCommas } from '../utils/formatNumberWithCommas';
import SocketService from '../utils/SocketService';
import CustomHeader from '../components/Header';

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
        }}
      >
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

const DriverHeader = ({
  driver,
}: {
  driver: OrderStatusResponse['driver'] | null | undefined;
}) => {
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
            ]}
          >
            <Text style={styles.driverImageAltText}>
              {driver.full_name
                .split(' ')
                .map((str: string) => str.charAt(0))
                .join('')}
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

// Unified Map Marker Component
type MarkerType = 'user' | 'driver' | 'branch';

const MapMarker = ({
  type,
  coordinate,
  animatedRegion,
  title,
}: {
  type: MarkerType;
  coordinate: LatLng | null;
  animatedRegion?: any;
  title?: string;
}) => {
  if (!coordinate && !animatedRegion) return null;

  const getMarkerContent = () => {
    switch (type) {
      case 'user':
        return (
          <View style={styles.userMarker}>
            <Text style={styles.markerText}>You</Text>
          </View>
        );
      case 'driver':
        return (
          <View style={styles.driverMarker}>
            <Icon_Motorcycle width={20} height={20} />
          </View>
        );
      case 'branch':
        return (
          <View style={styles.branchMarker}>
            <Icon_Branch width={20} height={20} color={COLORS.white} />
          </View>
        );
    }
  };

  // Use animated marker for driver, regular marker for others
  if (type === 'driver' && animatedRegion) {
    return (
      <Marker.Animated 
        coordinate={animatedRegion}
        title={title}
        tracksViewChanges={false}
        identifier={`${type}-marker`}
      >
        {getMarkerContent()}
      </Marker.Animated>
    );
  }

  return (
    <Marker
      coordinate={coordinate!}
      title={title}
      tracksViewChanges={false}
      identifier={`${type}-marker`}
    >
      {getMarkerContent()}
    </Marker>
  );
};

const TrackOrderScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const dispatch = useDispatch();
  const { orderId, order_type, addressLatitude, addressLongitude } =
    useRoute<OrderScreenRouteProps>().params;

  const isTakeaway = order_type === 'takeaway';
  const isFocused = useIsFocused();
  const userState = store.getState().user;
  const mapRef = useRef<MapView>(null);

  // State
  const [region, setRegion] = useState(INITIAL_REGION);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [addressLocation, setAddressLocation] = useState<LatLng | null>(null);
  const [branchLocation, setBranchLocation] = useState<LatLng | null>(null);
  const [initialMapLoad, setInitialMapLoad] = useState(true);
  const [hasFittedOnce, setHasFittedOnce] = useState(false);

  // Refs
  const driverRegionRef = useRef<any>(
    new AnimatedRegion({
      latitude: INITIAL_REGION.latitude,
      longitude: INITIAL_REGION.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // API Queries
  const { data: orderStatus, isLoading } = useGetOrderStatusQuery(orderId, {
    pollingInterval: isFocused ? 2000 : undefined,
  });
  const { data: orderData } = useGetOrderQuery(orderId);

  useLayoutEffect(() => {
    if (!orderId) return;

    navigation.setOptions({
      headerLeft: () => <CustomHeader title={`Order #${orderId}`} />,
    });

  }, [orderId]);

  // Debounced function to update driver location
  const updateDriverLocation = useCallback(
    (coordinates: { lat: number; long: number }) => {
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
      }, 1000);
    },
    []
  );

  // Animate AnimatedRegion when driverLocation changes (smooth movement, prevents flicker)
  useEffect(() => {
    if (!driverLocation || !driverRegionRef.current) return;

    try {
      if (driverRegionRef.current.timing) {
        driverRegionRef.current
          .timing({
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            duration: 600,
            useNativeDriver: false,
          })
          .start();
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
  }, [
    orderStatus?.status_history,
    orderStatus?.estimated_delivery_time,
    orderStatus?.driver,
  ]);

  useEffect(() => {
    const statusHistory = memoizedOrderStatus?.status_history;
    if (!statusHistory || statusHistory.length === 0) return;

    const latestStatus = statusHistory[statusHistory.length - 1];
    const isDelivered = latestStatus?.key === 'delivered';

    if (isDelivered) {
      dispatch(ordersApi.util.invalidateTags(['Order']));
      const navigationTimeout = setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('OrderDetails', {
            id: orderId,
            order_type: order_type,

          });
        }
      }, 1000);

      return () => {
        clearTimeout(navigationTimeout);
      };
    }
  }, [memoizedOrderStatus?.status_history, navigation, orderId, order_type, dispatch]);

  // Helper function to update map region
  const updateMapRegion = useCallback((location: LatLng) => {
    const newRegion = {
      ...location,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    };
    if (mapRef.current && !initialMapLoad) {
      mapRef.current.animateToRegion(newRegion, 1000);
    } else {
      setRegion(newRegion);
    }
  }, [initialMapLoad]);

  // Extract and set locations based on order type
  useEffect(() => {
    if (isTakeaway && orderData?.branch) {
      // For takeaway: extract branch location
      const branch = orderData.branch as typeof orderData.branch & { location_coordinates?: string };
      if (branch.location_coordinates) {
        try {
          const coordinatesArray = JSON.parse(branch.location_coordinates);
          if (Array.isArray(coordinatesArray) && coordinatesArray.length >= 2) {
            const [latitude, longitude] = coordinatesArray;
            const location = {
              latitude: Number(latitude),
              longitude: Number(longitude),
            };
            setBranchLocation(location);
            updateMapRegion(location);
          }
        } catch (error) {
          console.error('Error parsing branch location:', error);
        }
      }
    } else if (!isTakeaway && addressLatitude != null && addressLongitude != null) {
      // For delivery: use address coordinates
      const location = {
        latitude: Number(addressLatitude),
        longitude: Number(addressLongitude),
      };
      setAddressLocation(location);
      updateMapRegion(location);
    }
  }, [isTakeaway, orderData?.branch, addressLatitude, addressLongitude, updateMapRegion]);

  useEffect(() => {
    if (!isTakeaway) {
      console.log('[Socket Debug] Setting up socket connection...');
      console.log('[Socket Debug] DRIVER_SOCKET_URL:', DRIVER_SOCKET_URL);
      console.log('[Socket Debug] userState.jwt exists:', !!userState.jwt);
      console.log('[Socket Debug] userState.id:', userState.id);
      console.log('[Socket Debug] orderId:', orderId);

      const socketInstance = SocketService.getInstance();
      console.log('[Socket Debug] SocketService instance obtained');

      socketInstance.connect(DRIVER_SOCKET_URL, {
        auth: userState.jwt || '',
      });
      console.log('[Socket Debug] connect() called');

      // Function to emit userJoin message
      const emitUserJoin = () => {
        const isConnected = socketInstance.isConnected();
        console.log('[Socket Debug] Checking connection before emit. Connected?', isConnected);

        if (!isConnected) {
          console.log('[Socket Debug] ⚠️ Socket not connected yet, will retry...');
          return false;
        }

        console.log('[Socket Debug] Emitting userJoin message...');
        const joinMessage = {
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
        };
        console.log('[Socket Debug] Join message payload:', JSON.stringify(joinMessage, null, 2));

        socketInstance.emit('message', joinMessage);
        console.log('[Socket Debug] ✅ userJoin message emitted');
        return true;
      };

      // Set up socket listeners
      console.log('[Socket Debug] Setting up socket listeners...');

      // Listen for connection events
      socketInstance.on('connect', () => {
        console.log('[Socket Debug] ✅ Socket connected event received in TrackOrderScreen');
        console.log('[Socket Debug] Socket ID:', socketInstance.getSocket()?.id);
        // Try to emit userJoin when connected
        emitUserJoin();
      });

      socketInstance.on('connect_error', (error) => {
        console.log('[Socket Debug] ❌ Socket connection error:', error);
        console.log('[Socket Debug] Error details:', JSON.stringify(error, null, 2));
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket Debug] ⚠️ Socket disconnected:', reason);
      });

      socketInstance.on('error', (error) => {
        console.log('[Socket Debug] ❌ Socket error event:', error);
      });

      // Listen for any message events to see what's coming through
      socketInstance.on('message', (data) => {
        console.log('[Socket Debug] 📨 Received message event:', JSON.stringify(data, null, 2));
      });

      // Subscribe to location updates (register this early, before connection)
      console.log('[Socket Debug] Registering onLocationUpdate listener...');
      socketInstance.on('onLocationUpdate', (coordinates) => {
        console.log('[Socket Debug] 🎯 onLocationUpdate Called!');
        console.log('[Socket Debug] 📍 Coordinates received:', JSON.stringify(coordinates, null, 2));
        console.log('[Socket Debug] Coordinates type:', typeof coordinates);
        console.log('[Socket Debug] Has lat?', !!coordinates?.lat);
        console.log('[Socket Debug] Has long?', !!coordinates?.long);

        if (coordinates && coordinates.lat && coordinates.long) {
          console.log('[Socket Debug] ✅ Valid coordinates, calling updateDriverLocation');
          updateDriverLocation(coordinates);
        } else {
          console.log('[Socket Debug] ⚠️ Invalid coordinates format');
        }
      });
      console.log('[Socket Debug] ✅ onLocationUpdate listener registered');

      // Try to emit immediately if already connected, otherwise wait for connect event
      const checkAndEmit = () => {
        if (!emitUserJoin()) {
          // If not connected, wait a bit and try again
          const retryTimeout = setTimeout(() => {
            console.log('[Socket Debug] Retrying emit after delay...');
            if (!emitUserJoin()) {
              console.log('[Socket Debug] ⚠️ Still not connected after retry. Will wait for connect event.');
            }
          }, 1000);
          return retryTimeout;
        }
        return null;
      };

      const retryTimeoutId = checkAndEmit();

      return () => {
        console.log('[Socket Debug] 🧹 Cleaning up socket connection...');
        if (retryTimeoutId) {
          clearTimeout(retryTimeoutId);
        }
        socketInstance.disconnect();
        // Clear debounce timer on cleanup
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        console.log('[Socket Debug] ✅ Cleanup complete');
      };
    } else {
      console.log('[Socket Debug] Skipping socket setup - isTakeaway is true');
    }
  }, [orderId, updateDriverLocation, isTakeaway, userState.id, userState.jwt]);

  // Fit map to show relevant locations
  useEffect(() => {
    // Wait for map to be ready
    if (!mapRef.current || initialMapLoad) return;

    if (isTakeaway && branchLocation) {
      // For takeaway: use animateToRegion with larger delta to zoom out
      mapRef.current.animateToRegion({
        ...branchLocation,
        latitudeDelta: 0.05, // Larger delta = more zoomed out
        longitudeDelta: 0.05,
      }, 500);
    } else if (!isTakeaway && addressLocation) {
      // For delivery: fit to address, add driver if available
      // Only prevent refitting if we've already fitted with both locations
      if (hasFittedOnce && driverLocation) return;
      
      const locations: LatLng[] = [addressLocation];
      if (driverLocation) {
        locations.push(driverLocation);
        setHasFittedOnce(true);
      }
      
      mapRef.current.fitToCoordinates(locations, {
        edgePadding: { top: 150, right: 150, bottom: 550, left: 150 },
        animated: true,
      });
    }
  }, [driverLocation, addressLocation, branchLocation, initialMapLoad, isTakeaway, hasFittedOnce]);

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
          {/* Markers */}
          {!isTakeaway && (
            <>
              <MapMarker
                type="user"
                coordinate={addressLocation}
                title="Your Location"
              />
              <MapMarker
                type="driver"
                coordinate={driverLocation}
                animatedRegion={driverRegionRef.current}
                title="Driver Location"
              />
            </>
          )}
          {isTakeaway && (
            <MapMarker
              type="branch"
              coordinate={branchLocation}
              title={orderData?.branch?.name || 'Branch Location'}
            />
          )}
        </MapView>

        {/* {isTakeaway && (
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
        )} */}
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
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: COLORS.darkColor, fontSize: 14 }}>
                  Estimated{' '}
                  {order_type === 'delivery' ? 'arrival' : 'preparation time'}:{' '}
                  {memoizedOrderStatus?.estimated_delivery_time} min
                </Text>
                {orderData && (
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      {orderData.currency?.symbol}{' '}
                      {formatNumberWithCommas(
                        Number(orderData.total?.default_currency)
                      )}
                    </Text>
                  </View>
                )}
              </View>
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
  backgroundColor: COLORS.backgroundColor      
    // backgroundColor: 'red',
  },
  mapContainer: {
    top: -10,
    position: 'relative',
    flex: 1,
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
  branchMarker: {
    backgroundColor: COLORS.primaryColor,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkColor,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryColor,
  },
});
