import React from 'react'
import { useTranslation } from 'react-i18next';
import Testing from '../components/Testing'

const HomePage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div style={{
             position: 'relative', 
             width: '100%', 
             display: 'flex', 
             justifyContent: 'center', 
             alignItems: 'start', 
             flexDirection: 'column',
             padding: '100px',
        }}>
            <h1 style={{ fontSize: '4em' }}>{t("global.title")}</h1>
            <Testing/>
        </div>
    )
}

export default HomePage
