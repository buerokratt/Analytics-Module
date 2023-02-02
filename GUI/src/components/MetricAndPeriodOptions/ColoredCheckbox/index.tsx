
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
            <div style={{
                padding: '0 .75rem',
                display: 'flex',
                alignItems: 'center',
                userSelect: 'none',
                // user-select: none;
                // -moz-user-select: none;
                // -webkit-user-select: none;
                // -ms-user-select: none;
            }}>
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={onClick}

                    style={{
                        zoom: 1.5,
                        cursor: 'pointer',
                        background: '#004277',
                    }}
                />
                <span
                    style={{
                        margin: '0 .5rem'
                    }}
                >
                    {label}
                </span>

                <span style={{
                    background: color,
                    height: '.5rem',
                    width: '.5rem',
                    borderRadius: '1rem',
                }} />
            </div>
        </label>
    )
}

export default CheckBoxButton;