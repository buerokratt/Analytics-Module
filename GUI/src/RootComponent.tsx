import React from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import { Layout } from './components'
import AdvisorsPage from './pages/AdvisorsPage'
import BurokrattPage from './pages/BurokrattPage'
import ChatsPage from './pages/ChatsPage'
import FeedbackPage from './pages/FeedbackPage'
import NotFoundPage from './pages/NotFoundPage'
import OverviewPage from './pages/OverviewPage'
import ReportsPage from './pages/ReportsPage'
import { ROUTES } from './resources/routes-constants'
import './styles/main.scss'

const RootComponent: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={"/"} element={<Navigate to="/overview" />} />
        <Route path={ROUTES.OVERVIEW_ROUTE} element={<OverviewPage />} />
        <Route path={ROUTES.CHATS_ROUTE} element={<ChatsPage />} />
        {/* <Route path={ROUTES.BUROKRATT_ROUTE} element={<BurokrattPage />} /> TODO: Add it in release 2.0 */}
        <Route path={ROUTES.FEEDBACK_ROUTE} element={<FeedbackPage />} />
        <Route path={ROUTES.ADVISORS_ROUTE} element={<AdvisorsPage />} />
        <Route path={ROUTES.REPORTS_ROUTE} element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default RootComponent
