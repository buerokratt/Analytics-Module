import React from 'react'
import { useTranslation } from "react-i18next";
import { Option } from '../../types/option';

interface OptionListProps {
    options: Option[],
    value?: string,
    onChange?: ((value: string) => void),
    placeholder?: string | undefined | null,
    multiple?: boolean,
}

const OptionList: React.FC<OptionListProps> = ({
    options,
    value,
    onChange,
    placeholder,
    multiple = false,
}) => {
    const { t } = useTranslation();

    return <select
        value={value}
        multiple={multiple}
        onChange={(v) => onChange?.(v.target.value)}
    >
        {placeholder && <option>{placeholder}</option>}
        {
            options.map(x =>
                <option key={x.id} value={x.id}>
                    {t(x.titleKey)}
                </option>
            )
        }
    </select >;
}

export default OptionList;