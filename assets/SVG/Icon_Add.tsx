import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function SvgComponent(props: SvgProps) {
  return (
    <Svg width={19} height={18} viewBox="0 0 19 18" fill="none" {...props}>
      <Path
        fill={props.color ?? '#8391A1'}
        d="M.5 9c0 .535.447.97.97.97h7.06v7.06c0 .523.435.97.97.97a.99.99 0 0 0 .982-.97V9.97h7.047A.98.98 0 0 0 18.5 9a.99.99 0 0 0-.97-.982h-7.048V.971A.99.99 0 0 0 9.5 0a.98.98 0 0 0-.97.97v7.048H1.47A.99.99 0 0 0 .5 9Z"
      />
    </Svg>
  );
}

export default SvgComponent;
