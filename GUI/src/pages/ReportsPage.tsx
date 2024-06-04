import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Button, Card, Dialog, Drawer, Icon, Section, Track } from '../components';
import OptionsPanel, { Option, OnChangeCallback } from '../components/MetricAndPeriodOptions';
import {
  deleteOpenDataSettings,
  deleteScheduledReport,
  downloadOpenDataCSV,
  getOpenDataDataset,
  openDataSettings,
  scheduledReports,
} from '../resources/api-constants';
import APISetupDrawer from '../components/OpenData/APISetupDrawer';
import { ODPSettings } from '../types/reports';
import DatasetCreation from '../components/OpenData/DatasetCreation';
import Popup from '../components/Popup';
import { saveAs } from 'file-saver';
import TooltipWrapper from '../components/TooltipWrapper';
import { request, Methods } from '../util/axios-client';
import withAuthorization, { ROLES } from '../hoc/with-authorization';

type ScheduledDataset = {
  datasetId: string;
  name: string;
  id: number;
  period: string;
};

const ReportsPage = () => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<OnChangeCallback>();
  const [apiSetupDrawerVisible, setApiSetupDrawerVisible] = useState(false);
  const [datasetCreationVisible, setDatasetCreationVisible] = useState<any>(false);
  const [apiSettings, setApiSettings] = useState<ODPSettings>({ odpKey: null, orgId: null });
  const [datasets, setDatasets] = useState<ScheduledDataset[]>([]);

  const [isSettingsConfirmationVisible, setIsSettingsConfirmationVisible] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchDatasets();
  }, []);

  const odpQueries = [
    'get-chat-count-total',
    'get-chat-count-no-csa',
    'get-avg-waiting-time',
    'get-avg-messages',
    'get-avg-time',
    'get-avg-time-no-csa',
    'get-avg-time-csa',
    'get-avg-session-length-client-left',
    'get-avg-session-length-csa',
    'get-avg-session-length-no-csa',
    'get-avg-response-time',
    'get-pct-correctly-understood',
  ];
  const [openDataOptions] = useState<Option[]>([
    {
      id: 'openDataMetrics',
      subOptions: odpQueries.map((oq) => ({ id: oq, labelKey: `reports.${oq}` })),
      labelKey: '',
    },
  ]);

  const getCSVFile = async () => {
    const result: any = await request({
      url: downloadOpenDataCSV(),
      method: Methods.post,
      withCredentials: true,
      data: { start: options?.start, end: options?.end, metrics: options?.options },
      responseType: 'blob',
    });
    saveAs(result, 'metrics.csv');
  };

  const fetchSettings = async () => {
    const result: any = await request({ url: openDataSettings(), withCredentials: true });
    setApiSettings(result.response);
  };

  const fetchDatasets = async () => {
    const result: any = await request({ url: scheduledReports(), withCredentials: true });
    setDatasets(result.response);
  };

  const fetchDataset = async (datasetId: string) => {
    const result: any = await request({ url: getOpenDataDataset(datasetId), withCredentials: true });
    setDatasetCreationVisible({ ...result.response.data, datasetId });
  };

  const deleteSettings = async () => {
    setApiSettings({ odpKey: null, orgId: null });
    await request({ url: deleteOpenDataSettings(), method: Methods.post, withCredentials: true });
  };

  const deleteSchedule = async (datasetId: string) => {
    await request({ url: deleteScheduledReport(), method: Methods.post, data: { datasetId }, withCredentials: true });
    fetchDatasets();
  };

  const disabled = options?.options.length === 0 || apiSettings.odpKey === null;

  return (
    <>
      <h1>{t('menu.reports')}</h1>
      <Card>
        <OptionsPanel
          metricOptions={openDataOptions}
          onChange={(d) => setOptions(d)}
          useColumns
        />
        <Section>
          <Track gap={16}>
            <TooltipWrapper
              enabled={disabled}
              text={t('reports.disabled_create_dataset_tooltip')}
            >
              <Button
                disabled={disabled}
                onClick={() => setDatasetCreationVisible(true)}
              >
                {t('reports.create-new-dataset')}
              </Button>
            </TooltipWrapper>
            <Button
              disabled={options?.options.length === 0}
              appearance="secondary"
              onClick={() => getCSVFile()}
            >
              {t('reports.download_csv')}
            </Button>
          </Track>
        </Section>
      </Card>

      {datasets.length === 0 ? (
        <Card header={<h3>{t('reports.created_datasets')}</h3>}>
          <p>{t('reports.no_datasets_description')}</p>
        </Card>
      ) : (
        <Card header={<h3>{t('reports.created_datasets')}</h3>}>
          {datasets.map((d) => (
            <Section key={d.id}>
              <Track justify="between">
                <strong>{d.name}</strong>
                <Track gap={16}>
                  <p>{t('reports.interval_' + d.period)}</p>
                  <Button
                    appearance="text"
                    onClick={() => fetchDataset(d.datasetId)}
                  >
                    <Icon icon={<MdEdit />} />
                    {t('global.edit')}
                  </Button>
                  <Button
                    appearance="text"
                    onClick={() => deleteSchedule(d.datasetId)}
                  >
                    <Icon icon={<MdDelete />} />
                    {t('global.delete')}
                  </Button>
                </Track>
              </Track>
            </Section>
          ))}
        </Card>
      )}

      <Card header={<h3>{t('reports.odp_title')}</h3>}>
        {!apiSettings.odpKey && (
          <Button onClick={() => setApiSetupDrawerVisible(true)}>{t('reports.setup_odp_access')}</Button>
        )}
        {apiSettings.odpKey && (
          <Track gap={20}>
            {t('reports.api_key')}:
            <strong style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {apiSettings.odpKey}
            </strong>
            <Button
              appearance="text"
              onClick={() => setIsSettingsConfirmationVisible(true)}
            >
              <Icon icon={<MdDelete />} /> {t('global.delete')}
            </Button>
          </Track>
        )}
      </Card>

      {isSettingsConfirmationVisible && (
        <Dialog
          title={t('reports.are_you_sure')}
          onClose={() => setIsSettingsConfirmationVisible(false)}
          footer={
            <>
              <Button
                onClick={() => {
                  setIsSettingsConfirmationVisible(false);
                  deleteSettings();
                }}
              >
                {t('global.delete')}
              </Button>
              <Button
                appearance="secondary"
                onClick={() => setIsSettingsConfirmationVisible(false)}
              >
                {t('global.cancel')}
              </Button>
            </>
          }
        >
          <p>{t('reports.api_key_delete_warning')}</p>
        </Dialog>
      )}

      <Drawer
        title={t('reports.setup_odp_access')}
        onClose={() => setApiSetupDrawerVisible(false)}
        style={{ transform: apiSetupDrawerVisible ? 'none' : 'translate(100%)', width: '450px' }}
      >
        <APISetupDrawer
          isDrawerVisible={apiSetupDrawerVisible}
          onClose={(settings) => {
            setApiSettings(settings);
            setApiSetupDrawerVisible(false);
          }}
        />
      </Drawer>
      {datasetCreationVisible && (
        <Popup
          onClose={() => {
            setDatasetCreationVisible(false);
          }}
          title={t('reports.create-new-dataset')}
        >
          <DatasetCreation
            metrics={options!.options}
            start={options!.start}
            end={options!.end}
            existingDataset={datasetCreationVisible}
            onClose={() => {
              setDatasetCreationVisible(false);
              fetchDatasets();
            }}
          />
        </Popup>
      )}
    </>
  );
};

export default withAuthorization(ReportsPage, [ROLES.ROLE_ADMINISTRATOR, ROLES.ROLE_ANALYST]);
