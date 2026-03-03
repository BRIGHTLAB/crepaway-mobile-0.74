// import * as React from 'react';
// import Svg, { SvgProps, Path } from 'react-native-svg';

// const Icon_Nav_Menu = (props: SvgProps) => {
//   return (
//     <Svg width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
//       <Path
//         fill={props.color}
//         d="M11.5 9h-2V2h-2v7h-2V2h-2v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.84 12.84 13.5 11.12 13.5 9V2h-2v7z"
//       />
//       <Path
//         fill={props.color}
//         d="M16.5 6v8H19v8h2.5V2c-2.76 0-5 2.24-5 4z"
//       />
//     </Svg>
//   );
// };

// export default Icon_Nav_Menu;


import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const Icon_Nav_Menu = (props: SvgProps) => (
  <Svg
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      stroke={props.color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 6V4.284c0-.768 0-1.152-.161-1.4a1 1 0 0 0-.614-.43c-.288-.067-.65.064-1.372.327L6.58 5.426c-.57.207-.854.31-1.064.492a1.5 1.5 0 0 0-.416.595c-.1.26-.1.562-.1 1.168v4.32m4 5h6m-6-3.5h6M9 10h6M8.2 21h7.6c1.12 0 1.68 0 2.108-.219a2 2 0 0 0 .874-.874C19 19.48 19 18.92 19 17.8V9.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C17.48 6 16.92 6 15.8 6H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C5 7.52 5 8.08 5 9.2v8.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C6.52 21 7.08 21 8.2 21Z"
    />
  </Svg>
)
export default Icon_Nav_Menu

