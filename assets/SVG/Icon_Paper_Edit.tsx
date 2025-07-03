import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

const Icon_Paper_Edit = (props: SvgProps) => {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M10 5.833V.383c.76.289 1.461.733 2.054 1.325l2.904 2.905a5.795 5.795 0 011.325 2.054h-5.45A.834.834 0 0110 5.833zm1.058 10.4A3.612 3.612 0 0010 18.788V20h1.213c.958 0 1.876-.38 2.554-1.058l5.672-5.673a1.916 1.916 0 00-2.708-2.708l-5.673 5.672zm-2.725 2.555c0-1.41.55-2.736 1.546-3.733l5.673-5.672a3.588 3.588 0 011.109-.751c-.003-.1-.008-.2-.014-.3h-5.814a2.503 2.503 0 01-2.5-2.5V.02C8.2.01 8.065 0 7.93 0H4.167A4.171 4.171 0 000 4.167v11.666A4.171 4.171 0 004.167 20h4.166v-1.212z"
        fill={props.color || '#8391A1'}
      />
    </Svg>
  );
};

export default Icon_Paper_Edit;
