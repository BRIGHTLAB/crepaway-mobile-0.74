import { TouchableOpacity } from '@gorhom/bottom-sheet';
import {
    useFocusEffect,
    useNavigation
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    BackHandler,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import Icon_Sign_Out from '../../assets/SVG/Icon_Sign_Out';
import InfoPopup from '../components/Popups/InfoPopup';
import Button from '../components/UI/Button';
import { DineInStackParamList } from '../navigation/DineInStack';
import {
    setBranchTable,
    setOrderType,
    setSessionTableId,
} from '../store/slices/userSlice';
import store from '../store/store';
import {
    COLORS,
    DINEIN_SOCKET_URL,
    SCREEN_PADDING,
    TYPOGRAPHY
} from '../theme';
import SocketService from '../utils/SocketService';

export type OrderedItem = {
    id: number;
    name: string;
    image_url: string | null;
    quantity: number;
    price: number | null
    symbol: string;
    special_instruction?: string | null;
    added_by: {
        id: number;
        name: string;
        image_url: string;
        type: 'waiter' | 'user';
    };
    epoch: number;
    deleted: number;
    disabled: boolean;
    status: 'pending' | 'in-kitchen';
    modifier_groups: Array<{
        id: number;
        name: string;
        modifier_groups_id: number;
        modifier_items: Array<{
            id: number;
            menu_items_modifier_groups_id: number;
            modifier_items_id: number;
            min_quantity: number;
            max_quantity: number;
            symbol: string;
            quantity: number;
            is_paused: number;
            paused_from_date: string | null;
            paused_to_date: string | null;
            paused_until: string | null;
            price: number | null;
            order: number | null;
            enabled: number;
            removed: number;
            plu: string;
            name: string;
        }>;
    }>;
};

export type OrderedItems = Record<string, OrderedItem>;

export type TableUser = {
    id: number;
    name: string;
    image_url: string | null;
    isOnline: boolean;
    isKing: boolean;
    isPending: boolean;
    isBanned?: boolean;
};

export type TableUsers = Record<string, TableUser>;

export type TableBannedUsers = Record<string, TableUser>;

export type TableWaiter = {
    id: number;
    name: string;
    image_url: string | null;
    isOnline: boolean;
};

export type TableWaiters = Record<string, TableWaiter>;

type TableUpdateMessage = {
    users: TableUsers,
    waiters: TableWaiters,
    bannedUsers: TableBannedUsers,
    items: OrderedItems,
    isLocked: boolean,
}

type DineInPendingScreenNavigationProp = NativeStackNavigationProp<
    DineInStackParamList,
    'Table'
>;



const DineInPendingScreen = () => {
    const dispatch = useDispatch();

    const navigation = useNavigation<DineInPendingScreenNavigationProp>();
    const userState = store.getState().user;
    const screenHeight = Dimensions.get('window').height;
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const [infoPopup, setInfoPopup] = useState({
        visible: false,
        title: '',
        message: ''
    })

    const { top } = useSafeAreaInsets();

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const socketInstance = SocketService.getInstance()

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.8,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();



        return () => pulse.stop();
    }, []);

    const joinTable = () => {
        if (!userState) return;
        const socketInstance = SocketService.getInstance();
        console.log('sending table session', userState.tableSessionId);
        console.log('sending table name', userState.branchTable);
        socketInstance.emit(
            'message',
            {
                type: 'UserJoinTable',
                data: {
                    tableName: userState.branchTable,
                    user: {
                        id: userState.id,
                        name: userState.name,
                        image_url: userState.image_url,
                    },
                    session_table: userState.tableSessionId,
                },
            },
            response => {
                console.log('join table response ', response);
                console.log('tableSessionId', userState.tableSessionId);
                console.log('server Session', response.session_table);

                if (response.success) {
                    dispatch(setSessionTableId(response.session_table));
                } else {

                    setInfoPopup({
                        visible: true,
                        title: '',
                        message: response?.message ?? 'Something went wrong!'
                    });

                    console.log('cant join the table:', response);
                }
            },

        );
        socketInstance.on('joinRequestApproval', (message) => {
            console.log('join request approval message', message)
            if (message.approved) {
                dispatch(setSessionTableId(message.session_table));
                console.log('join request approved');
                navigation.navigate('Table')
            } else {
                setInfoPopup({
                    visible: true,
                    title: 'Request Denied',
                    message: 'Your request to join the table was not approved.'
                });
                dispatch(setSessionTableId(null));
                dispatch(setBranchTable(null));
            }
        })
    };


    useEffect(() => {

        socketInstance.connect(DINEIN_SOCKET_URL, {
            authorization: `Bearer ${userState.jwt}` || '',
        });

        // join Table
        joinTable();

    }, [])


    useFocusEffect(
        React.useCallback(() => {
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                () => {
                    dispatch(
                        setOrderType({
                            menuType: null,
                            orderTypeAlias: null,
                        }),
                    );
                    return true; // Prevent default behavior
                },
            );

            // Cleanup function that runs when screen loses focus or unmounts
            return () => backHandler.remove();
        }, [dispatch]),
    );

    const handleLeaveTable = () => {
        if (!userState) return;

        const socketInstance = SocketService.getInstance();

        // Emit leave table event
        socketInstance.emit(
            'message',
            {
                type: 'UserLeaveTable',
                data: {
                    tableName: userState.branchTable,
                    user: {
                        id: userState.id,
                    },
                },
            },
            // response => {
            //   console.log('Left table response:', response);

            //   if (response.success) {
            //     // Reset session ID and order type in Redux store

            //   }
            // },
        );

        dispatch(setSessionTableId(null));
        dispatch(setBranchTable(null));
        dispatch(
            setOrderType({
                menuType: null,
                orderTypeAlias: null,
            }),
        );
    };



    useEffect(() => {
        // Animate out when component unmounts
        return () => {
            Animated.timing(translateY, {
                toValue: screenHeight,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        };
    }, []);

    return (
        <View style={[styles.container, {
            paddingTop: top + 10,
        }]}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleLeaveTable}>
                    <Icon_Sign_Out color={COLORS.white} />
                </TouchableOpacity>
            </View>
            <View style={styles.pendingContainer}>
                <View style={styles.pendingContent}>
                    <Animated.View
                        style={[
                            styles.pendingIconContainer,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <ActivityIndicator size="large" color={COLORS.primaryColor} />
                    </Animated.View>

                    <Text style={styles.pendingTitle}>Waiting for Approval</Text>
                    <Text style={styles.pendingSubtitle}>
                        You've requested to join this table.{'\n'}
                        Please wait for the table admin to approve your request.
                    </Text>

                    <View style={styles.pendingButtonContainer}>
                        <Button
                            onPress={handleLeaveTable}
                        >
                            Cancel Request
                        </Button>
                    </View>
                </View>
            </View>

            <InfoPopup visible={infoPopup.visible} onClose={() => {

                setInfoPopup({
                    message: '',
                    title: '',
                    visible: false,
                });
                // Reset the order type and session after user acknowledges
                dispatch(
                    setOrderType({
                        menuType: null,
                        orderTypeAlias: null,
                    }),
                );
                dispatch(setSessionTableId(null));

            }} message={infoPopup.message}
            />
        </View>
    );
};

export default DineInPendingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primaryColor,
    },
    headerContainer: {
        flexDirection: 'row',
        height: 80,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: SCREEN_PADDING.horizontal,
        gap: 10,
    },
    headerTitle: {
        ...TYPOGRAPHY.HEADLINE,
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    waitersList: {},
    waiterSeparator: {
        width: 16,
    },
    waiterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    waiterImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    waiterText: {
        ...TYPOGRAPHY.BODY,
        color: 'white',
    },
    mainContent: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 70, // Space for the order button
        overflow: 'hidden', // Ensure content doesn't overflow the rounded corners
    },
    usersListWrapper: {
        backgroundColor: COLORS.white,
    },
    orderButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: `${COLORS.foregroundColor}20`,
        marginBottom: 10,
    },
    // Pending Screen Styles
    pendingContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SCREEN_PADDING.horizontal,
    },
    pendingContent: {
        alignItems: 'center',
        maxWidth: 300,
    },
    pendingIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primaryColor}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    pendingTitle: {
        ...TYPOGRAPHY.SUB_HEADLINE,
        color: COLORS.foregroundColor,
        textAlign: 'center',
        marginBottom: 16,
    },
    pendingSubtitle: {
        ...TYPOGRAPHY.BODY,
        color: COLORS.foregroundColor,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    pendingButtonContainer: {
        width: '100%',
    },
});