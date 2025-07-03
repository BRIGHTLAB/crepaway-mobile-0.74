import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Wallet = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill="#191919"
        d="M19.5 7.2H6.167a2.557 2.557 0 0 1-1.863-.8 2.543 2.543 0 0 1 1.863-.8h15c1.09-.005 1.089-1.596 0-1.6h-15C3.866 4 2 5.791 2 8v8c0 2.209 1.866 4 4.167 4H19.5c1.38 0 2.5-1.074 2.5-2.4v-8c0-1.326-1.12-2.4-2.5-2.4Zm-.833 7.2c-1.09-.005-1.09-1.595 0-1.6 1.09.005 1.09 1.595 0 1.6Z"
      />
    </Svg>
  );
};
export default Icon_Wallet;
