import React from 'react'
import BurokrattOptionList from '../components/BurokrattOptionList';
import Layout from '../components/Layout';


const BurokrattPage: React.FC = () => {
    return (
        <Layout>
            <h1>Burokratt</h1>
            <BurokrattOptionList />
        </Layout>
    )
}

export default BurokrattPage