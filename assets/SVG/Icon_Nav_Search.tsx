import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Nav_Search = (props: SvgProps) => {
  return (
    <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
      <Path
        fill={props.color}
        d="m22.135 19.871-3.871-3.873a8.755 8.755 0 1 0-1.764 1.764l3.872 3.873a1.246 1.246 0 0 0 1.763-1.762v-.002Zm-10.848-2.856a6.229 6.229 0 1 1 0-12.458 6.229 6.229 0 0 1 0 12.458Z"
      />
    </Svg>
  );
};
export default Icon_Nav_Search;
