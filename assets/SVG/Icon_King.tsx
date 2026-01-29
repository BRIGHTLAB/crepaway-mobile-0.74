import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"

const KingIcon = (props: SvgProps) => (
    <Svg
        width={18}
        height={14}
        fill="none"
        {...props}
    >
        <Path
            fill="#4E1485"
            d="M17.299 4.057a1.433 1.433 0 0 0-1.609 0l-2.5 1.55a.192.192 0 0 1-.158 0 .225.225 0 0 1-.133-.1l-2.667-4.8a1.459 1.459 0 0 0-2.5 0L4.965 5.5a.225.225 0 0 1-.133.1.192.192 0 0 1-.158 0L2.215 4.024a1.433 1.433 0 0 0-1.583.033 1.45 1.45 0 0 0-.6 1.5l1.4 6.575a1.459 1.459 0 0 0 1.425 1.159h12.242a1.459 1.459 0 0 0 1.425-1.159l1.4-6.575a1.45 1.45 0 0 0-.625-1.5Z"
        />
    </Svg>
)
export default KingIcon
