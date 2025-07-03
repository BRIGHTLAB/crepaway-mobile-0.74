import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function Icon_Decrease_Quantity(props: SvgProps) {
  return (
    <Svg width={18} height={2} viewBox="0 0 18 2" fill="none" {...props}>
      <Path
        d="M0 .982c0 .534.447.97.97.97H17.03A.98.98 0 0018 .983.99.99 0 0017.03 0H.97A.99.99 0 000 .982z"
        fill={props?.color ?? '#8391A1'}
      />
    </Svg>
  );
}

export default Icon_Decrease_Quantity;
