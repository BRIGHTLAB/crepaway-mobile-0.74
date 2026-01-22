import BottomSheet from '@gorhom/bottom-sheet';
import Geolocation from '@react-native-community/geolocation';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  StyleSheet,
  View
} from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS
} from 'react-native-permissions';
import Icon_Add from '../../assets/SVG/Icon_Add';
import { useGetZonesQuery, Zone } from '../api/dataApi';
import Marker from '../components/Map/Marker';
import AddressDetailsSheet from '../components/Sheets/AddressDetailsSheet';
import Button from '../components/UI/Button';
import { COLORS, SCREEN_PADDING, TYPOGRAPHY } from '../theme';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Type for route params - works with all navigation stacks
type AddressMapRouteParams = {
  editAddress?: Address;
};

const AddressMapScreen = () => {
  const route = useRoute<RouteProp<{ AddressMap: AddressMapRouteParams }, 'AddressMap'>>();
  const navigation = useNavigation();
  const editAddress = route.params?.editAddress;
  const isEditing = !!editAddress;

  const mapRef = useRef<MapView>(null);
  const detailsSheetRef = useRef<BottomSheet>(null);

  // Use edit address coordinates as initial region if editing
  const initialRegion = editAddress
    ? {
      latitude: editAddress.latitude,
      longitude: editAddress.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }
    : {
      latitude: 37.78825,
      longitude: 35.4324,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };

  const [region, setRegion] = useState<Region>(initialRegion);

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<Region | null>(null);
  const { data: zones } = useGetZonesQuery();

  useEffect(() => {
    // Only request location if not editing
    if (!isEditing) {
      requestLocationAccess();
    }
  }, []);

  const requestLocationAccess = async () => {
    console.log('requestLocationAccess');

    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    if (!permission) {
      // If platform is not supported, just try to get location directly
      getCurrentLocation();
      return;
    }

    try {
      // Check current permission status
      const result = await check(permission);
      console.log('resultPermission', result);

      if (result === RESULTS.GRANTED) {
        // Permission already granted, get location
        getCurrentLocation();
      } else if (result === RESULTS.DENIED || result === RESULTS.UNAVAILABLE) {
        // Permission not granted yet, request it
        const requestResult = await request(permission);
        console.log('requestResult', requestResult);

        if (requestResult === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          // Permission denied after request
          showPermissionDeniedAlert();
        }
      } else if (result === RESULTS.BLOCKED) {
        // Location permissions are blocked - ask user to open settings
        showLocationBlockedAlert();
      }
    } catch (error) {
      console.log('Permission check error:', error);
      // Still try to get location in case permissions work
      getCurrentLocation();
    }
  };

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      'Location Permission Required',
      'Location access is needed to show your current position on the map. You can still use the map by manually selecting a location.',
      [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Try Again',
          onPress: () => requestLocationAccess(),
        },
      ],
    );
  };

  const showLocationBlockedAlert = () => {
    Alert.alert(
      'Location Access Required',
      'Please enable location access in your device settings to use your current location.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            openSettings();
          },
        },
      ],
    );
  };

  const getCurrentLocation = () => {
    console.log('getCurrentLocation');

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

        setRegion(newRegion);

        console.log(
          'Location received, isMapReady:',
          isMapReady,
          'mapRef:',
          !!mapRef.current,
        );

        // Always try to animate if mapRef exists, regardless of isMapReady
        if (mapRef.current) {
          console.log('Attempting to animate to location');
          mapRef.current.animateToRegion(newRegion, 500);
        } else {
          console.log('Storing location as pending');
          setPendingLocation(newRegion);
        }
      },
      error => {
        console.log('Location error:', error);

        // Check specific error codes
        if (error.code === 1) {
          // Permission denied
          showPermissionDeniedAlert();
        } else if (error.code === 2) {
          // Position unavailable - likely location services are off
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services for this app in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('App-Prefs:Privacy&path=LOCATION');
                  } else {
                    openSettings();
                  }
                },
              },
            ],
          );
        } else if (error.code === 3) {
          // Timeout
          Alert.alert(
            'Location Timeout',
            'Unable to get your location. Please check your GPS signal and try again.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Retry', onPress: () => getCurrentLocation() },
            ],
          );
        }
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };

  // Function to check if a point is inside a polygon
  const isPointInPolygon = (
    point: { latitude: number; longitude: number },
    polygon: Zone['boundary'],
  ) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat;
      const yi = polygon[i].lng;
      const xj = polygon[j].lat;
      const yj = polygon[j].lng;

      const intersect =
        yi > point.longitude !== yj > point.longitude &&
        point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);

    // Check if the center point is inside any zone
    const centerPoint = {
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    };

    const zoneInPoint =
      zones?.find(zone => isPointInPolygon(centerPoint, zone.boundary)) || null;

    setSelectedZone(zoneInPoint);
  };

  // Add method to handle map ready
  const onMapReady = () => {
    console.log('Map is ready');
    setIsMapReady(true);

    // If we have a pending location, animate to it
    if (pendingLocation) {
      console.log('Animating to pending location');
      // Use requestAnimationFrame to ensure the map is fully rendered
      requestAnimationFrame(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(pendingLocation, 500);
          setPendingLocation(null);
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true} // Keep default button
        followsUserLocation={false} // Don't automatically follow user
        onMapReady={onMapReady}
        onRegionChangeComplete={onRegionChangeComplete}>
        {zones?.map(zone => (
          <Polygon
            key={zone.id}
            coordinates={zone.boundary.map(point => ({
              latitude: point.lat,
              longitude: point.lng,
            }))}
            fillColor={
              selectedZone?.id === zone.id
                ? 'rgba(76, 175, 80, 0.15)' // Material Design Green 500 with 15% opacity
                : 'rgba(158, 158, 158, 0.05)'
            } // Material Design Gray 500 with 5% opacity
            strokeColor={
              selectedZone?.id === zone.id
                ? 'rgba(76, 175, 80, 0.6)' // Material Design Green 500 with 60% opacity
                : 'rgba(158, 158, 158, 0.3)'
            } // Material Design Gray 500 with 30% opacity
            strokeWidth={1.5}
          />
        ))}
      </MapView>

      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <Button
          onPress={() => detailsSheetRef.current?.expand()}
          disabled={!selectedZone && !isEditing}
          icon={<Icon_Add
            color={(selectedZone || isEditing) ? COLORS.lightColor : COLORS.borderColor}
          />}
          style={{
            width: '60%'
          }}
          iconPosition='left'
        >
          {isEditing ? 'Save location' : 'Add location'}
        </Button>
      </View>


      {/* Fixed Custom Marker in Center */}
      <View style={styles.markerFixed} pointerEvents="none">
        <Marker />
      </View>

      <AddressDetailsSheet
        ref={detailsSheetRef}
        coordinates={{
          longitude: region.longitude,
          latitude: region.latitude,
        }}
        editAddress={editAddress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingVertical: SCREEN_PADDING.vertical,
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: 'absolute',
    top: 8,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  googlePlacesContainer: {
    flex: 0,
    width: '100%',
    zIndex: 1,
  },
  textInputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leftIconContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  rightIconContainer: {
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    padding: 5,
  },
  markerFixed: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    // if we change the svg we must change the marginLeft and Top as well
    //we can't use translate with % here
    marginLeft: -11,
    marginTop: -50,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationButtonText: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.borderColor,
  },
});

export default AddressMapScreen;
