import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const Icon_Paper_Plane = (props: SvgProps) => {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
            <Path
                fill={props.color ? props.color : '#FFFFFF'}
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
            />
        </Svg>
    );
};

export default Icon_Paper_Plane;


