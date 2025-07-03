import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function Icon_Checkout(props: SvgProps) {
  return (
    <Svg width={20} height={16} viewBox="0 0 20 16" fill="none" {...props}>
      <Path
        d="M4.167.5h11.666A4.172 4.172 0 0120 4.667H0A4.172 4.172 0 014.167.5z"
        fill="#F7F7F7"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.222 14.278A4.172 4.172 0 010 11.333v-5h20v5a4.172 4.172 0 01-4.167 4.167H4.167a4.172 4.172 0 01-2.945-1.222zm4.4-2.667a1.25 1.25 0 10-2.077-1.389 1.25 1.25 0 002.078 1.39z"
        fill="#F7F7F7"
      />
    </Svg>
  );
}

export default Icon_Checkout;
