import React, { useEffect, useState } from 'react'
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md'
import Icon from '../Icon'
import './DropDown.scss'

type DropDownProps = {
  options: string[]
  defaultValue: string
  onChangeSelection: (option: string) => void
}

const DropDown: React.FC<DropDownProps> = ({
  options,
  defaultValue,
  onChangeSelection,
}: DropDownProps): JSX.Element => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string>(defaultValue)

  const onClickHandler = (option: string): void => {
    onChangeSelection(option)
  }

  const toggleDropDown = () => {
    setShowDropDown(!showDropDown)
  }

  useEffect(() => {
    setShowDropDown(showDropDown)
  }, [showDropDown])

  return (
    <>
      <button
        className="dropdown_button"
        onClick={(): void => toggleDropDown()}
        onBlur={(e: React.FocusEvent<HTMLButtonElement>): void => {
          if (e.currentTarget === e.target) {
            setShowDropDown(false)
          }
        }}
      >
        <label className="selected_value">{selectedOption}</label>
        <Icon
          icon={!showDropDown ? <MdArrowDropDown /> : <MdArrowDropUp />}
          size="small"
        />
        {showDropDown && (
          <div className={'dropdown'}>
            {options.map((option: string, index: number): JSX.Element => {
              return (
                <p
                  key={index}
                  onClick={(): void => {
                    setSelectedOption(option)
                    onClickHandler(option)
                  }}
                >
                  {option}
                </p>
              )
            })}
          </div>
        )}
      </button>
    </>
  )
}

export default DropDown
