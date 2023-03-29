import React, { ReactNode } from 'react'
import Tooltip from '../Tooltip'
import './styles.scss'

interface TooltipWrapperProps {
  enabled: boolean
  text: string
  children: ReactNode
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ enabled, text, children }: TooltipWrapperProps) => {
  if (!enabled)
    return (<>{children}</>)
  return (
    <Tooltip
      content={
        <p className='tooltip-text-container'>
          {text}
        </p>
      }
    >
      <div>
        {children}
      </div>
    </Tooltip>
  )
}

export default TooltipWrapper
