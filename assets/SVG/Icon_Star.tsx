import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Star = (props: SvgProps) => {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" {...props}>
      <Path
        fill="#DB0032"
        d="m12.782 14.996-4.506-3.312-4.506 3.312L5.5 9.648 1 6.357h5.56L8.276 1l1.719 5.357h5.559l-4.502 3.291 1.73 5.348Z"
      />
    </Svg>
  );
};
export default Icon_Star;
