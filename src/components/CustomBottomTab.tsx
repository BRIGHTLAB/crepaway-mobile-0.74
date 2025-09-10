import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../theme";
import { SvgProps } from "react-native-svg";
import RightCurvedBar from "./Curve";

export interface INavigationItem {
    Icon?: React.ComponentType<{ color: string }>;
    title: string | null;
    focused: boolean;
    name?: string;
    headerShown?: boolean;
}

export const NavigationItem = ({ Icon, title, focused, name }: INavigationItem) => {
    return (
        <View
            style={{
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: 3,
                elevation: 0,
                // borderWidth: 1,
                // borderColor: 'green',
                paddingTop: 10,
                ...(name === 'HomeStack' ? { top: -15 } : {}),
            }}>
            {Icon && <Icon
                color={focused ? '#DB0032' : '#F7F7F7F7'}
                width={name === 'HomeStack' ? 74 : 27}
                height={name === 'HomeStack' ? 74 : 27}
            />}
            <Text
                style={{
                    color: focused ? COLORS.primaryColor : COLORS.lightColor,
                    fontSize: 11,
                    width: '100%',
                    textTransform: 'uppercase',
                    fontFamily: 'Poppins-Regular',
                }}>
                {title}
            </Text>
        </View>
    );
};

export interface CustomBottomTabProps {
    state: {
        index: number;
        routes: Array<{
            key: string;
            name: string;
        }>;
    };
    descriptors: {
        [key: string]: {
            options: {
                tabBarAccessibilityLabel?: string;
            };
        };
    };
    navigation: {
        navigate: (name: string) => void;
        emit: (event: {
            type: string;
            target: string;
            canPreventDefault: boolean;
        }) => { defaultPrevented: boolean };
    };
    navigationData:
    {
        name: string;
        Component: () => React.JSX.Element;
        title: string;
        Icon: (props: SvgProps) => React.JSX.Element;
        headerShown: boolean;
        initialScreen: string;
    }[]

}

export const CustomBottomTab = ({
    state,
    descriptors,
    navigation,
    navigationData
}: CustomBottomTabProps) => {
    return (
        <View style={styles.mainContainer}>
            {/* Right Divider */}
            <View pointerEvents="none" style={{ position: 'absolute', right:0,  top: -50, backgroundColor: 'transparent', width: '100%' }}>

                <View style={{ height: 50, position: 'relative', backgroundColor: 'transparent'}} >
                    <RightCurvedBar
                        width={25}
                        height={25}
                        color="black"
                        style={{ position: "absolute", right: -1, bottom: 1 }}
                    />

                    <RightCurvedBar
                        flip
                        width={25}
                        height={25}
                        color="black"
                        style={{ position: "absolute", left: -1, bottom: 1 }}
                    />
                </View>
            </View>

            <View style={styles.bottomTabContainer}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const navItem = navigationData.find((item: any) => item.name === route.name);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            style={[
                                styles.tabItem,
                                navItem?.name === 'HomeStack' && styles.homeTabItem,
                            ]}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}>
                            <NavigationItem
                                Icon={navItem?.Icon}
                                title={navItem?.title || ''}
                                name={navItem?.name}
                                focused={isFocused}
                                headerShown={navItem?.headerShown}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        position: 'relative',
        borderWidth: 1
    },
    bottomTabContainer: {
        flexDirection: 'row',
        backgroundColor: 'black',
        height: 85,
        justifyContent: 'space-around',
        alignItems: 'center',

        // borderWidth: 3,
        // borderColor: 'white',

    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // paddingBottom: 15,
        // borderWidth: 1,
        // borderColor: 'white'
    },
    homeTabItem: {
        marginTop: -20,
    },
    headerTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: COLORS.darkColor,
    },
    rightDivider: {

    }
});



