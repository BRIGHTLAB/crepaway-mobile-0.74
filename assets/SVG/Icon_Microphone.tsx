import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const Icon_Microphone = (props: SvgProps) => {
    return (
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
            <Path
                fill={props.color ? props.color : '#8391A1'}
                d="M12 14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2s-2 .9-2 2v6c0 1.1.9 2 2 2z"
            />
            <Path
                fill={props.color ? props.color : '#8391A1'}
                d="M19 10v1c0 3.87-3.13 7-7 7s-7-3.13-7-7v-1c0-.55-.45-1-1-1s-1 .45-1 1v1c0 4.97 4.03 9 9 9s9-4.03 9-9v-1c0-.55-.45-1-1-1s-1 .45-1 1z"
            />
            <Path
                fill={props.color ? props.color : '#8391A1'}
                d="M12 18c.55 0 1-.45 1-1v-2h-2v2c0 .55.45 1 1 1z"
            />
        </Svg>
    );
};

export default Icon_Microphone;






