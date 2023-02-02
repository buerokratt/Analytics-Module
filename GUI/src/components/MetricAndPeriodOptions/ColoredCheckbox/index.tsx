import React from "react"
import "./styles.scss"

interface CheckBoxButtonProps {
    label: string,
    selected: boolean,
    onClick: () => void,
    color: string,
}

const CheckBoxButton: React.FC<CheckBoxButtonProps> = ({
    label,
    selected,
    onClick,
    color,
}) => {
    return (
        <label>
            <div className="container">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onClick}
                    className="checkbox-input"
                />
                <span className="checkbox-label">
                    {label}
                </span>

                <span
                    className="color-circle"
                    style={{ background: color }}
                />
            </div>
        </label>
    )
}

export default CheckBoxButton;