import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

function Icon_Cart(props: SvgProps) {
  return (
    <Svg width={20} height={21} viewBox="0 0 20 21" fill="none" {...props}>
      <Path
        d="M12.61 9.416a5.04 5.04 0 006.574-1.371l-.2 1.109a4.205 4.205 0 01-4.138 3.458H4.823a2.523 2.523 0 002.372 1.682h8.78a.84.84 0 010 1.681h-8.78a4.204 4.204 0 01-4.176-3.713L1.862 2.424a.84.84 0 00-.835-.742H.841A.84.84 0 01.84 0h.186a2.522 2.522 0 012.504 2.226l.036.296h7.203a5.04 5.04 0 001.84 6.894zM7.567 18.498a1.682 1.682 0 11-3.363 0 1.682 1.682 0 013.363 0zM14.294 20.18a1.682 1.682 0 100-3.364 1.682 1.682 0 000 3.364z"
        fill={props.color || '#F7F7F7'}
      />
      <Path
        d="M14.294 5.886h-1.682a.84.84 0 110-1.682h1.682V2.522a.84.84 0 011.681 0v1.682h1.682a.84.84 0 010 1.682h-1.681v1.681a.84.84 0 01-1.682 0V5.886z"
        fill={props.color || '#F7F7F7'}
      />
    </Svg>
  );
}

export default Icon_Cart;
