import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function Icon_Checkmark(props: SvgProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M2.28516 9.93758L6.40995 14.0624L15.2495 5.22363"
        stroke={props.color ?? '#C6C300'}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Icon_Checkmark;
