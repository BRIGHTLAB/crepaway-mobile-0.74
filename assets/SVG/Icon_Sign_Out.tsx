import * as React from 'react';
import Svg, { ClipPath, Defs, G, Path, SvgProps } from 'react-native-svg';
const Icon_Sign_Out = (props: SvgProps) => {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <G fill={props.color ?? '#DB0032'} clipPath="url(#a)">
        <Path d="M9.563 12.5a.833.833 0 0 0-.833.833v2.5a2.5 2.5 0 0 1-2.5 2.5H4.167a2.5 2.5 0 0 1-2.5-2.5V4.167a2.5 2.5 0 0 1 2.5-2.5H6.23a2.5 2.5 0 0 1 2.5 2.5v2.5a.833.833 0 0 0 1.667 0v-2.5A4.172 4.172 0 0 0 6.23 0H4.167A4.172 4.172 0 0 0 0 4.167v11.666A4.172 4.172 0 0 0 4.167 20H6.23a4.172 4.172 0 0 0 4.167-4.167v-2.5a.833.833 0 0 0-.834-.833Z" />
        <Path d="m19.057 8.232-3.821-3.821a.834.834 0 1 0-1.179 1.178l3.552 3.552L5 9.166a.833.833 0 0 0 0 1.667l12.657-.026-3.603 3.604a.833.833 0 1 0 1.179 1.178l3.821-3.822a2.5 2.5 0 0 0 .002-3.535Z" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h20v20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
export default Icon_Sign_Out;
