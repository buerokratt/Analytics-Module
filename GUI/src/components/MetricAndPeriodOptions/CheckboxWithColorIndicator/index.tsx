import React from "react"
import { FormCheckbox } from "../../FormElements"
import Track from "../../Track"
import "./styles.scss"

interface CheckBoxWithColorIndicatorProps {
    label: string,
    selected: boolean,
    onClick: () => void,
    color?: string,
}

const CheckBoxWithColorIndicator: React.FC<CheckBoxWithColorIndicatorProps> = ({
    label,
    selected,
    onClick,
    color,
}) => {
    return (
        <Track>
            <FormCheckbox
                item={{
                    label: label,
                    value: label,
                }}
                checked={selected}
                onChange={onClick}
            />

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

export default CheckBoxWithColorIndicator
