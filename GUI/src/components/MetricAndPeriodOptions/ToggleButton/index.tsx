
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
        style={{
            background: pressed ? '#004277' : '#fff',
            color: pressed ? '#fff' : '#000',
            cursor: 'pointer',
            border: '1px solid gray',
            borderRadius: '1rem',
            padding: '.3rem 1.5rem',
            margin: '.2rem',
        }}
    >
        {label}
    </button>
}


export default ToggleButton;