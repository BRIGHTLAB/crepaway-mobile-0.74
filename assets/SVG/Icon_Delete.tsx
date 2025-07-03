import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function SvgComponent(props: SvgProps) {
  return (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M5 4V1C5 0.44772 5.44772 0 6 0H14C14.5523 0 15 0.44772 15 1V4H20V6H18V19C18 19.5523 17.5523 20 17 20H3C2.44772 20 2 19.5523 2 19V6H0V4H5ZM7 2V4H13V2H7Z"
        fill={props.color ?? '#191919'}
      />
    </Svg>
  );
}

export default SvgComponent;
