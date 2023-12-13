import React, { useEffect, useState } from 'react';
import { getTesting } from '../resources/api-constants';
import { request } from '../util/axios-client';

const Testing: React.FC = () => {
  const [testing, setTesting] = useState('');

  useEffect(() => {
    request({ url: getTesting() })
      .then((res) => setTesting(JSON.stringify(res)))
      .catch((error) => setTesting(error.message.toString()));
  }, []);

  return (
    <div>
      <h3>testing data:</h3>
      {testing}
    </div>
  );
};

export default Testing;
