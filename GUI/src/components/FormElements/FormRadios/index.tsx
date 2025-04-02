import { FC, ChangeEvent, useId, useState, useEffect } from 'react';

import './FormRadios.scss';

type FormRadiosType = {
  label: string;
  name: string;
  hideLabel?: boolean;
  items: {
    label: string;
    value: string;
  }[];
  onChange: (selectedValue: string) => void;
};

const FormRadios: FC<FormRadiosType> = ({ label, name, hideLabel, items, onChange }) => {
  const id = useId();
  const [selectedValue, setSelectedValue] = useState<string>(items[0]?.value || '');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <fieldset
      className="radios"
      role="group"
    >
      {label && !hideLabel && <label className="radios__label">{label}</label>}
      <div className="radios__wrapper">
        {items.map((item, index) => (
          <div
            key={`${item.value}-${index}`}
            className="radios__item"
          >
            <input
              type="radio"
              name={name}
              id={`${id}-${item.value}`}
              value={item.value}
              checked={item.value === selectedValue}
              onChange={handleChange}
            />
            <label htmlFor={`${id}-${item.value}`}>{item.label}</label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default FormRadios;
