import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Sign_Out = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={props?.color ?? '#191919'}
        d="M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm4 9V8l-5 4 5 4v-3h6v-2H9Z"
      />
    </Svg>
  );
};
export default Icon_Sign_Out;
