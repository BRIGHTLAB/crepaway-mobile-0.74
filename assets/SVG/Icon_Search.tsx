import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Search = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={props.color ? props.color : '#8391A1'}
        d="m21.635 19.871-3.871-3.873A8.755 8.755 0 1 0 16 17.762l3.872 3.873a1.246 1.246 0 0 0 1.763-1.762v-.002Zm-10.848-2.856a6.229 6.229 0 1 1 0-12.458 6.229 6.229 0 0 1 0 12.458Z"
      />
    </Svg>
  );
};
export default Icon_Search;
