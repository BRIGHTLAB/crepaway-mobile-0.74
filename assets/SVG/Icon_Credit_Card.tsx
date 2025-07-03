import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Credit_Card = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        fill={props.color ? props.color : '#191919'}
        d="M6.167 4.5h11.666A4.172 4.172 0 0 1 22 8.667H2A4.172 4.172 0 0 1 6.167 4.5Z"
      />
      <Path
        fill={props.color ? props.color : '#191919'}
        fillRule="evenodd"
        d="M3.222 18.278A4.172 4.172 0 0 1 2 15.333v-5h20v5a4.172 4.172 0 0 1-4.167 4.167H6.167a4.172 4.172 0 0 1-2.945-1.222Zm4.4-2.667a1.25 1.25 0 1 0-2.077-1.389 1.25 1.25 0 0 0 2.078 1.39Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
export default Icon_Credit_Card;
