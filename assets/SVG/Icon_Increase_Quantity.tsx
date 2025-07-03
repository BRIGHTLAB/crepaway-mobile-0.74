import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function Icon_Increase_Quantity(props: SvgProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none" {...props}>
      <Path
        d="M0 9c0 .535.447.97.97.97h7.06v7.06c0 .523.435.97.97.97a.99.99 0 00.982-.97V9.97h7.047A.98.98 0 0018 9a.99.99 0 00-.97-.982H9.981V.971A.99.99 0 009 0a.98.98 0 00-.97.97v7.048H.97A.99.99 0 000 9z"
        fill={props.color || '#DB0032'}
      />
    </Svg>
  );
}

export default Icon_Increase_Quantity;
