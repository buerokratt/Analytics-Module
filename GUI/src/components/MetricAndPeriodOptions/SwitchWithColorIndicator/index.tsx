import React from "react"
import { SwitchBox } from "../../FormElements"
import Track from "../../Track"
import "./styles.scss"

interface SwitchWithColorIndicatorProps {
    label: string,
    selected: boolean,
    onClick: () => void,
    color?: string,
}

const SwitchWithColorIndicator: React.FC<SwitchWithColorIndicatorProps> = ({
    label,
    selected,
    onClick,
    color,
}) => {
    return (
        <Track isFlex={false} isAlignItems align="center" gap={8} className="track switch-with-color-indicator">
            <SwitchBox
                name={label}
                label={label}
                hideLabel
                checked={selected}
                onCheckedChange={onClick}
            />
            <span className="switch-with-color-indicator__label" onClick={onClick}>{label}</span>

            {
                color &&
                <span
                    className="color-circle"
                    style={{ background: color }}
                />
            }
        </Track>
    )
}

export default SwitchWithColorIndicator
