import React, { forwardRef, PropsWithChildren } from 'react'
import clsx from 'clsx'

import './Box.scss'

type BoxProps = {
  color?: 'default' | 'blue' | 'yellow' | 'green' | 'red'
}

const Box = forwardRef<HTMLDivElement, PropsWithChildren<BoxProps>>(({ color = 'default', children }, ref) => {
  return (
    <div ref={ref} className={clsx(['box', `box--${color}`])}>
      {children}
    </div>
  )
})

Box.displayName = 'box'

export default Box
