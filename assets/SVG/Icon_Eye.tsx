import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function Icon_Eye(props: SvgProps) {
  return (
    <Svg
      viewBox="0 0 20 20"
      width={22}
      height={22}
      fill="currentColor"
      {...props}>
      <Path d="M10 4.4C3.439 4.4 0 9.232 0 10c0 .766 3.439 5.6 10 5.6 6.56 0 10-4.834 10-5.6 0-.768-3.44-5.6-10-5.6zm0 9.907c-2.455 0-4.445-1.928-4.445-4.307 0-2.379 1.99-4.309 4.445-4.309s4.444 1.93 4.444 4.309c0 2.379-1.989 4.307-4.444 4.307zM10 10c-.407-.447.663-2.154 0-2.154-1.228 0-2.223.965-2.223 2.154s.995 2.154 2.223 2.154c1.227 0 2.223-.965 2.223-2.154 0-.547-1.877.379-2.223 0z" />
    </Svg>
  );
}

export default Icon_Eye;
