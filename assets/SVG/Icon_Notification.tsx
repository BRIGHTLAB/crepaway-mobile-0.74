import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const Icon_Notification = (props: SvgProps) => {
  return (
    <Svg width={24} height={25} viewBox="0 0 24 25" fill="none" {...props}>
      <Path
        fill={props.color ? props.color : '#191919'}
        d="m19.34 7.946 1.477 4.869a4.252 4.252 0 0 1-4.07 5.487H6.95a4.253 4.253 0 0 1-4.132-5.26l1.147-4.71a7.929 7.929 0 0 1 15.375-.386ZM9.65 21.86a4.244 4.244 0 0 1-1.565-1.857h7.785a4.244 4.244 0 0 1-6.22 1.857Z"
      />
    </Svg>
  );
};
export default Icon_Notification;
