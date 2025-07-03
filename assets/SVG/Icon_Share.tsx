import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Share = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill="#191919"
        d="M13 14h-2a8.999 8.999 0 0 0-7.968 4.81A10.133 10.133 0 0 1 3 18C3 12.477 7.477 8 13 8V3l10 8-10 8v-5Z"
      />
    </Svg>
  );
};
export default Icon_Share;
