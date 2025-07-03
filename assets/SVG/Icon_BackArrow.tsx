import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function Icon_BackArrow(props: SvgProps) {
  return (
    <Svg width={9} height={16} viewBox="0 0 9 16" fill="none" {...props}>
      <Path
        d="M0 8c0 .307.115.57.354.805l6.903 6.897a.95.95 0 00.716.298C8.55 16 9 15.548 9 14.951c0-.289-.115-.551-.31-.75L2.47 8 8.69 1.799c.195-.208.31-.47.31-.76A1.02 1.02 0 007.973 0a.95.95 0 00-.716.298L.354 7.195A1.119 1.119 0 000 8z"
        fill={props.color || '#191919'}
      />
    </Svg>
  );
}

export default Icon_BackArrow;
