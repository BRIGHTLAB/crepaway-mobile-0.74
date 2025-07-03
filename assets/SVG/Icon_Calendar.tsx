import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const Icon_Calendar = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M2 17.833A4.171 4.171 0 006.167 22h11.666A4.171 4.171 0 0022 17.833v-7.5H2v7.5zM4.5 14.5c0-.92.747-1.667 1.667-1.667h1.666c.92 0 1.667.748 1.667 1.667v1.667c0 .919-.748 1.666-1.667 1.666H6.167c-.92 0-1.667-.747-1.667-1.666V14.5zm3.334 1.667H6.167V14.5h1.666l.001 1.667zM22 7.833v.834H2v-.834a4.171 4.171 0 014.167-4.166H7v-.834a.834.834 0 011.667 0v.834h6.666v-.834a.834.834 0 011.667 0v.834h.833A4.171 4.171 0 0122 7.833z"
        fill={'#8391A1'}
      />
    </Svg>
  );
};

export default Icon_Calendar;
