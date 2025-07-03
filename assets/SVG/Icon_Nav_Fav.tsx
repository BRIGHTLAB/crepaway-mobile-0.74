import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Nav_Fav = (props: SvgProps) => {
  return (
    <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
      <Path
        fill={props.color}
        d="M17.79 2a5.977 5.977 0 0 0-2.926.814 5.785 5.785 0 0 0-2.114 2.134 5.785 5.785 0 0 0-2.114-2.134A5.978 5.978 0 0 0 7.71 2 6.3 6.3 0 0 0 3.4 3.951a5.986 5.986 0 0 0-1.646 4.346c0 6.052 10.04 13.041 10.466 13.338l.53.365.53-.365c.427-.295 10.466-7.286 10.466-13.338A5.986 5.986 0 0 0 22.1 3.951 6.3 6.3 0 0 0 17.79 2Z"
      />
    </Svg>
  );
};
export default Icon_Nav_Fav;
