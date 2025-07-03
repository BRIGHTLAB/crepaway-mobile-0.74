import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Wishlist_Filled = (props: SvgProps) => {
  return (
    <Svg width={24} height={25} viewBox="0 0 24 25" fill="none" {...props}>
      <Path
        fill={props.color ?? '#DB0032'}
        d="M17.04 2.348a5.977 5.977 0 0 0-2.926.814A5.785 5.785 0 0 0 12 5.295a5.785 5.785 0 0 0-2.114-2.133 5.978 5.978 0 0 0-2.926-.814 6.3 6.3 0 0 0-4.31 1.95 5.985 5.985 0 0 0-1.646 4.347c0 6.051 10.04 13.04 10.466 13.337l.53.366.53-.366c.427-.294 10.466-7.286 10.466-13.337a5.986 5.986 0 0 0-1.646-4.346 6.3 6.3 0 0 0-4.31-1.951Z"
      />
    </Svg>
  );
};
export default Icon_Wishlist_Filled;
