import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Arrow_Right = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={props.color ? props.color : '#F7F7F7'}
        d="M16 12c0 .307-.115.57-.354.805l-6.903 6.897a.95.95 0 0 1-.716.298C7.45 20 7 19.548 7 18.951c0-.289.115-.551.31-.75L13.53 12 7.31 5.799a1.102 1.102 0 0 1-.31-.76C7 4.453 7.451 4 8.027 4c.283 0 .53.1.716.298l6.903 6.897c.239.236.345.498.354.805Z"
      />
    </Svg>
  );
};
export default Icon_Arrow_Right;
