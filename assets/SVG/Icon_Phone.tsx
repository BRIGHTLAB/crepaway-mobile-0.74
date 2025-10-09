import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const Icon_Phone = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M14.625 2h-5.25C6.963 2 5 3.87 5 6.167v11.666C5 20.131 6.963 22 9.375 22h5.25C17.037 22 19 20.13 19 17.833V6.167C19 3.869 17.037 2 14.625 2zm-1.75 17.5h-1.75c-.483 0-.875-.373-.875-.833 0-.46.392-.834.875-.834h1.75c.483 0 .875.374.875.834 0 .46-.392.833-.875.833z"
        fill={props.color || '#8391A1'}
      />
    </Svg>
  );
};

export default Icon_Phone;
