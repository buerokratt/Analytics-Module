import { t } from 'i18next';
import { Option } from '../../components/MetricAndPeriodOptions';

export const metricOptions: Option[] = [
  {
    id: 'intents',
    labelKey: 'burokratt.intents',
    subOptions: [
      { id: 'ordered', labelKey: 'burokratt.orderByUsability', color: '#fdbf47' },
      { id: 'new', labelKey: 'burokratt.newIntents', color: '#ed7d32' },
      { id: 'modified', labelKey: 'burokratt.modifiedIntents', color: '#8ab4d5' },
      { id: 'avg', labelKey: 'burokratt.avgChatIntents', color: '#00ff00' },
    ],
    unit: t('units.intents') ?? 'intents',
  },
  {
    id: 'sessions',
    labelKey: 'burokratt.sessions',
    subOptions: [
      { id: 'byk', labelKey: 'burokratt.idle', color: '#fdbf47' },
      { id: 'csa', labelKey: 'burokratt.csa', color: '#ed7d32' },
      { id: 'customer', labelKey: 'burokratt.closed', color: '#8ab4d5' },
    ],
    unit: t('units.minutes') ?? 'minutes',
  },
  {
    id: 'averageResponseSpeed',
    labelKey: 'burokratt.averageResponseSpeed',
    unit: t('units.seconds') ?? 'seconds',
  },
  {
    id: 'understoodQuestions',
    labelKey: 'burokratt.understoodQuestions',
    unit: t('units.questions') ?? 'questions',
  },
];
