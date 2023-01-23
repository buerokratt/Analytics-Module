import React from 'react'
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../resources/routes-constants';
import './styles.scss';

const menuItems = [
    { to: ROUTES.OVERVIEW_ROUTE, titleKey: 'menu.overview' },
    { to: ROUTES.CHATS_ROUTE, titleKey: 'menu.chats' },
    { to: ROUTES.BUROKRATT_ROUTE, titleKey: 'menu.burokratt' },
    { to: ROUTES.FEEDBACKS_ROUTE, titleKey: 'menu.feedbacks' },
    { to: ROUTES.ADVISORS_ROUTE, titleKey: 'menu.advisors' },
    { to: ROUTES.REPORTS_ROUTE, titleKey: 'menu.reports' },
]

const SideMenu: React.FC = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    
    return (
        <div className='side-menu-container'>
            {menuItems.map(item => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`side-menu-item ${pathname === item.to && 'active'}`}
                    >
                        {t(item.titleKey)}
                    </Link>
                ))}
        </div>
    )
}

export default SideMenu