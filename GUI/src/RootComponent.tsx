import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ChatsPage from './pages/ChatsPage'
import NotFoundPage from './pages/NotFoundPage'
import OverviewPage from './pages/OverviewPage'
import { ROUTES } from './resources/routes-constants'
import './styles/main.sass'

const RootComponent: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path={ROUTES.OVERVIEW_ROUTE} element={<OverviewPage />} />
                <Route path={ROUTES.CHATS_ROUTE} element={<ChatsPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    )
}

export default RootComponent
