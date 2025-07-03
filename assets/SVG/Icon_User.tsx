import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_User = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={props.color ? props.color : '#8391A1'}
        d="M4 22a8 8 0 1 1 16 0H4Zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6Z"
      />
    </Svg>
  );
};
export default Icon_User;
