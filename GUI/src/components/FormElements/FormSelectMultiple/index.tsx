import React, { FC, SelectHTMLAttributes, useId, useState } from 'react'
import { useMultipleSelection, useSelect } from 'downshift'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { MdArrowDropDown } from 'react-icons/md'

import { Button, Icon } from '../..'
import './FormSelect.scss'

type FormSelectMultipleProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  name: string
  hideLabel?: boolean
  options: {
    label: string
    value: string
  }[]
  onSelectionChange?: (selection: { label: string; value: string } | null) => void
}

const itemToString = (item: { label: string; value: string } | null) => {
  return item ? item.value : ''
}

const FormSelectMultiple: FC<FormSelectMultipleProps> = ({
  label,
  hideLabel,
  options,
  disabled,
  placeholder,
  defaultValue,
  onSelectionChange,
}) => {
  const id = useId()
  const { t } = useTranslation()
  const defaultSelected = options.find((o) => o.value === defaultValue) || null
  const [selectedItem, setSelectedItem] = useState<{ label: string; value: string } | null>(defaultSelected)
  const { isOpen, getToggleButtonProps, getLabelProps, getMenuProps, getItemProps } = useSelect({
    id,
    items: options,
    itemToString,
    selectedItem,
    defaultHighlightedIndex: 0,
    stateReducer: (_, actionAndChanges) => {
      const { changes, type } = actionAndChanges
      switch (type) {
        case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
        case useSelect.stateChangeTypes.ToggleButtonKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true, // keep the menu open after selection.
          }
      }
      return changes
    },
    onStateChange: ({ type, selectedItem }) => {
      switch (type) {
        case useSelect.stateChangeTypes.ToggleButtonKeyDownEnter:
        case useSelect.stateChangeTypes.ToggleButtonKeyDownSpaceButton:
        case useSelect.stateChangeTypes.ItemClick:
          if (selectedItem) {
            if (selectedItems.includes(selectedItem)) {
              removeSelectedItem(selectedItem)
            } else {
              addSelectedItem(selectedItem)
            }

            //setSelectedItem(newSelectedItem ?? null)
            //if (onSelectionChange) onSelectionChange(newSelectedItem ?? null)
          }
          break
        default:
          break
      }
    },
  })
  const { addSelectedItem, removeSelectedItem, selectedItems } = useMultipleSelection<{
    label: string
    value: string
  }>()

  const selectClasses = clsx('select', disabled && 'select--disabled')

  const placeholderValue = placeholder || t('global.choose')

  return (
    <div className={selectClasses}>
      {label && !hideLabel && (
        <label
          htmlFor={id}
          className="select__label"
          {...getLabelProps()}
        >
          {label}
        </label>
      )}
      <div className="select__wrapper">
        <div
          className="select__trigger"
          {...getToggleButtonProps()}
        >
          {selectedItems.map((i) => i.label).join(', ') || placeholderValue}
          <Icon
            label="Dropdown icon"
            size="medium"
            icon={<MdArrowDropDown color="#5D6071" />}
          />
        </div>
        <ul
          className="select__menu"
          {...getMenuProps()}
        >
          {isOpen &&
            options.map((item, index) => (
              <li
                className={clsx('select__option', { 'select__option--selected': selectedItems.includes(item) })}
                key={`${item.value}${index}`}
                {...getItemProps({ item, index })}
              >
                {item.label}
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default FormSelectMultiple
