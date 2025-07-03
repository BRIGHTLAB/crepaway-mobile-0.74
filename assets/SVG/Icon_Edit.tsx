import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Edit = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
      <Path
        fill={props.color ? props.color : '#191919'}
        d="M12 7.833v-5.45c.76.289 1.461.733 2.054 1.325l2.904 2.905a5.795 5.795 0 0 1 1.326 2.054h-5.45A.834.834 0 0 1 12 7.833Zm1.058 10.4A3.612 3.612 0 0 0 12 20.788V22h1.213c.958 0 1.876-.38 2.554-1.058l5.672-5.673a1.916 1.916 0 0 0-2.708-2.708l-5.673 5.672Zm-2.725 2.555c0-1.41.55-2.736 1.546-3.733l5.673-5.672a3.587 3.587 0 0 1 1.109-.751c-.003-.1-.008-.2-.014-.3h-5.814a2.503 2.503 0 0 1-2.5-2.5V2.02C10.2 2.01 10.065 2 9.93 2H6.167A4.171 4.171 0 0 0 2 6.167v11.666A4.171 4.171 0 0 0 6.167 22h4.166v-1.212Z"
      />
    </Svg>
  );
};
export default Icon_Edit;
