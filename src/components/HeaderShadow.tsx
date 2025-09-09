import { StyleSheet, View } from "react-native";

type Props = {};
const HeaderShadow = ({ }: Props) => {
    return (
        <View pointerEvents="none" style={styles.mainContainer} />
    );
};

export default HeaderShadow;

const styles = StyleSheet.create({

    mainContainer: {
        position: 'absolute',
        top: -10,
        right: 0, 
        height: 10,
        width: '100%',
        backgroundColor: 'white',

        overflow: 'visible',

        /* shadow */
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 5,

        zIndex: 1

    }
});