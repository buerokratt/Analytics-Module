import React from "react"
import "./styles.scss";

interface ToggleButtonProps {
    label: string,
    value: string,
    selectedValue: string,
    onClick: (value: string) => void,
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
    label,
    value,
    selectedValue,
    onClick,
}) => {
    const pressed = value === selectedValue;
    return <button
        onClick={() => onClick(value)}
        className={`toggle-button ${pressed ? 'selected' : ''}`}
    >
        {label}
    </button>
}


export default ToggleButton;