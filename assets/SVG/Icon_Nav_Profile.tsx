import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Nav_Profile = (props: SvgProps) => {
  return (
    <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
      <Path
        fill={props.color}
        d="M4.5 22a8 8 0 1 1 16 0h-16Zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6Z"
      />
    </Svg>
  );
};
export default Icon_Nav_Profile;
