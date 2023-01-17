import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { getTesting } from '../resources/api-constants';

const Testing: React.FC = () => {
    const [testing, setTesting] = useState('');

    useEffect(() => {
        axios.get(getTesting())
            .then((res) => setTesting(JSON.stringify(res.data)))
            .catch((error) => setTesting(error.message.toString()));
    }, []);
        
    return (
        <div>
            <h3>testing data:</h3>
            {testing}
        </div>
    )
}

export default Testing
