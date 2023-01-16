import React, { ReactElement } from 'react'
import SideMenu from '../SideMenu'
import './styles.scss'

interface LayoutProps{
    children: React.ReactNode,
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className='main-container'>
            <SideMenu />
            {children}
        </div>
    )
}

export default Layout
