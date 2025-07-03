import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Camera = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 25 24" fill="none" {...props}>
      <Path
        fill="currentColor"
        d="M17.268 4.5 16.09 2.973A2.52 2.52 0 0 0 14.11 2h-3.22a2.519 2.519 0 0 0-1.98.973L7.733 4.5h9.535ZM12.5 17a3.333 3.333 0 1 0 0-6.667 3.333 3.333 0 0 0 0 6.667Z"
      />
      <Path
        fill="currentColor"
        fillRule="evenodd"
        d="M6.667 6.167h11.666a4.172 4.172 0 0 1 4.167 4.166v7.5A4.172 4.172 0 0 1 18.333 22H6.667A4.172 4.172 0 0 1 2.5 17.833v-7.5a4.172 4.172 0 0 1 4.167-4.166Zm3.055 11.657a5 5 0 1 0 5.556-8.315 5 5 0 0 0-5.556 8.315Z"
        clipRule="evenodd"
      />
    </Svg>
  );
};
export default Icon_Camera;
