import React, { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './styles.scss'

type Props = {
  isHidden: boolean
  children: ReactNode
  closeDrawer: () => void
}

const OverviewSidebar = ({ isHidden, children, closeDrawer }: Props) => {
  return (
    <div className={`sidebar-container ${isHidden && 'sidebar-hidden'}`}>
      <div className="title-row">
        <h3>Muuda vaadet</h3>
        <button onClick={closeDrawer}>X</button>
      </div>
      {children}
    </div>
  )
}

export default OverviewSidebar
