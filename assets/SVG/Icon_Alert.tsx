import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Alert = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill="#191919"
        fillRule="evenodd"
        d="m13.233 3.702 8.57 14.17c.556.943-.13 2.128-1.233 2.128H3.43c-1.102 0-1.788-1.184-1.233-2.127l8.569-14.17c.551-.937 1.916-.937 2.467 0Zm.015 9.012c0 .67-.558 1.215-1.25 1.215-.69 0-1.25-.544-1.25-1.215V9.072c0-.67.56-1.215 1.25-1.215.692 0 1.25.544 1.25 1.215v3.642Zm-2.5 3.643c0 .67.56 1.215 1.25 1.215s1.25-.544 1.25-1.215c0-.67-.56-1.214-1.25-1.214s-1.25.544-1.25 1.214Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
export default Icon_Alert;
