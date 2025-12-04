import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
const Icon_Crown = ({ color = '#4E1485', ...props }: SvgProps) => (
  <Svg
    width={12}
    height={9}
    viewBox="0 0 12 9"
    fill="none"
    {...props}
  >
    <Path
      fill={color ?? '#4E1485'}
      d="M10.89 2.554a.902.902 0 0 0-1.012 0l-1.574.976a.12.12 0 0 1-.1 0 .142.142 0 0 1-.084-.063L6.442.445a.918.918 0 0 0-1.574 0L3.126 3.462a.142.142 0 0 1-.084.063.12.12 0 0 1-.1 0l-1.547-.992a.902.902 0 0 0-.997.021.913.913 0 0 0-.378.945l.881 4.139a.918.918 0 0 0 .898.73h7.706a.918.918 0 0 0 .897-.73l.882-4.14a.913.913 0 0 0-.394-.944Z"
    />
  </Svg>
)
export default Icon_Crown
