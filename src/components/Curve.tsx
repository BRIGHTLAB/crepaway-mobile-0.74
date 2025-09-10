// RightCurvedBar.tsx
import React from "react"
import { ViewStyle } from "react-native"
import Svg, { Path, G } from "react-native-svg"

type RightCurvedBarProps = {
  /** Bar thickness (px) */
  width?: number
  /** Bar height (px) */
  height?: number
  /** Fill color */
  color?: string
  /** Optional wrapper style (e.g., { position:'absolute', left:0, top:20 }) */
  style?: ViewStyle
  /** Mirror horizontally (left-side version) */
  flip?: boolean
}

const RightCurvedBar: React.FC<RightCurvedBarProps> = ({
  width = 30,
  height = 30,
  color = "#000",
  style,
  flip = false,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 60 60"
      preserveAspectRatio="none"
      style={style}
    >
      <G transform={flip ? "translate(60,0) scale(-1,1)" : undefined}>
        <Path fill={color} d="M.974 60.062s60 0 60-60v60h-60Z" />
      </G>
    </Svg>
  )
}

export default RightCurvedBar
