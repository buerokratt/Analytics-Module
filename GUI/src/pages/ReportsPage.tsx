import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdDelete } from 'react-icons/md'
import { Button, Card, Dialog, Drawer, Icon, Section, Track } from '../components'
import OptionsPanel from '../components/MetricAndPeriodOptions'
import MetricOptionsGroup, { Option, OnChangeCallback } from '../components/MetricAndPeriodOptions'
import { ToastContext } from '../components/Toast/ToastContext'
import { deleteOpenDataSettings, downloadOpenDataCSV, openDataSettings } from '../resources/api-constants'
import APISetupDrawer from '../components/OpenData/APISetupDrawer'
import { ODPSettings } from '../types/reports'
import DatasetCreation from '../components/OpenData/DatasetCreation'
import Popup from '../components/Popup'

const ReportsPage = () => {
  const { t } = useTranslation()
  const [options, setOptions] = useState<OnChangeCallback>()
  const [apiSetupDrawerVisible, setApiSetupDrawerVisible] = useState(false)
  const [datasetCreationVisible, setDatasetCreationVisible] = useState(false)
  const [apiSettings, setApiSettings] = useState<ODPSettings>({ odpKey: null, orgId: null })

  const [isSettingsConfirmationVisible, setIsSettingsConfirmationVisible] = useState(false)

  const toast = useContext(ToastContext)

  useEffect(() => {
    fetchSettings()
  }, [])

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
  ]

  const openDataOptions: Option[] = [
    {
      id: 'openDataMetrics',
      labelKey: '',
      subOptions: odpQueries.map((oq) => ({ id: oq, labelKey: `reports.${oq}` })),
    },
  ]

  const getCSVFile = async () => {
    const result = await axios.post(downloadOpenDataCSV(), {
      start: options?.start,
      end: options?.end,
      metrics: options?.options,
    })
    console.log(result)
  }

  const fetchSettings = async () => {
    const result = await axios.get(openDataSettings())
    setApiSettings(result.data.response)
  }

  const deleteSettings = async () => {
    setApiSettings({ odpKey: null, orgId: null })
    await axios.post(deleteOpenDataSettings())
  }

  return (
    <>
      <h1>{t('menu.reports')}</h1>
      <Card>
        <OptionsPanel
          metricOptions={openDataOptions}
          onChange={(d) => {
            setOptions(d)
          }}
        ></OptionsPanel>
        <Section>
          <Track gap={16}>
            <Button
              disabled={options?.options.length === 0 || apiSettings.odpKey === null}
              onClick={() => setDatasetCreationVisible(true)}
            >
              {t('reports.create-new-dataset')}
            </Button>
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

      <Card header={<h3>Eesti avaandmete teabevärav</h3>}>
        {!apiSettings.odpKey && (
          <Button onClick={() => setApiSetupDrawerVisible(true)}>{t('reports.setup_odp_access')}</Button>
        )}
        {apiSettings.odpKey && (
          <Track gap={20}>
            {t('reports.apikey')}:
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
        >
          <Track gap={20}>
            <Button
              onClick={() => {
                setIsSettingsConfirmationVisible(false)
                deleteSettings()
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
          </Track>
        </Dialog>
      )}

      <Drawer
        title={t('reports.setup_odp_access')}
        onClose={() => setApiSetupDrawerVisible(false)}
        style={{ transform: apiSetupDrawerVisible ? 'none' : 'translate(100%)', width: '450px' }}
      >
        <APISetupDrawer
          onClose={(settings) => {
            setApiSettings(settings)
            setApiSetupDrawerVisible(false)
          }}
        />
      </Drawer>
      {!datasetCreationVisible && (
        <Popup
          onClose={() => {setDatasetCreationVisible(false)}}
          title={t('reports.create-new-dataset')}
        >
          <Card>
            <DatasetCreation />
          </Card>
        </Popup>
      )}
    </>
  )
}

export default ReportsPage
