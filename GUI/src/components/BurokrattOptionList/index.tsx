import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import OptionList from '../OptionList';
import {
    intentsOptions,
    metricOptions,
    periodOptions,
    sessionsOptions
} from './data';
import './styles.scss';

const BurokrattOptionList: React.FC = () => {
    const { t } = useTranslation();
    const [metric, setMetric] = useState(() => metricOptions[0].id);
    const [period, setPeriod] = useState(() => periodOptions[0].id);

    const selectedMetricIsIntents = metric == '1';
    const selectedMetricIsSessions = metric == '2';

    return (
        <div className='container'>
            <OptionList
                options={metricOptions}
                value={metric}
                onChange={setMetric}
                placeholder={t('burokratt.chooseMetric')}
            />
            {
                selectedMetricIsIntents &&
                <OptionList
                    options={intentsOptions}
                    placeholder={t('burokratt.additionalOptions')}
                    multiple
                />
            }
            {
                selectedMetricIsSessions &&
                <OptionList
                    options={sessionsOptions}
                    placeholder={t('burokratt.additionalOptions')}
                    multiple
                />
            }

            <OptionList
                options={periodOptions}
                value={period}
                onChange={setPeriod}
                placeholder={t('burokratt.choosePeriod')}
            />
        </div>
    )
}

export default BurokrattOptionList;