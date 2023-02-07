import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isNullishCoalesce } from 'typescript'
import { Button, Card, Drawer, FormInput, Section, Track } from '../components'
import OptionsPanel from '../components/MetricAndPeriodOptions'
import MetricOptionsGroup, { Option, OnChangeCallback } from '../components/MetricAndPeriodOptions'
import { reportMetricsDownload, reportODPKey } from '../resources/api-constants'

const ReportsPage = () => {
  const { t } = useTranslation()
  const [options, setOptions] = useState<OnChangeCallback>()
  const [apiSetupDrawerVisible, setApiSetupDrawerVisible] = useState(false)
  const [apiKey, setApiKey] = useState(null)

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
    const response = await axios.post(reportMetricsDownload(), {
      start: options?.start,
      end: options?.end,
      metrics: options?.options,
    })
    console.log(response)
  }

  const getODPKey = async () => {
    return null
    const response = await axios.get(reportODPKey())
    const key = response.data.response?.key
    setApiKey(key)
    return key
  }

  const setODPKey = async (key: string) => {
    const response = await axios.post(reportODPKey(), { apiKey: key })
    return response.data.response?.key
  }

  const createNewDataset = async () => {
    const existingKey = apiKey ?? (await getODPKey())
    console.log(existingKey)
    if (!existingKey) {
      setApiSetupDrawerVisible(true)
    }

    // present dataset creation fields
    // let API know what metrics and
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
            <Button onClick={() => createNewDataset()}>{t('reports.create-new-dataset')}</Button>
            <Button
              appearance="secondary"
              onClick={() => getCSVFile()}
            >
              {t('reports.download_csv')}
            </Button>
          </Track>
        </Section>
      </Card>
      <Drawer
        title={t('reports.create-new-dataset')}
        onClose={() => setApiSetupDrawerVisible(false)}
        style={{ transform: apiSetupDrawerVisible ? 'none' : 'translate(100%)', width: '450px' }}
      >
        <Track
          direction="vertical"
          justify="between"
          style={{ height: '100%' }}
        >
          <Section>
            <Section>
              <h6>Juurdepääs on vaja seadistada ainult esimesel korral</h6>
              <br />
              <ol>
                <li>
                  Loo konto <a href="https://avaandmed.eesti.ee">avaandmed.eesti.ee</a> ja seo see asutusega
                </li>
                <li>Loo settingutes uus API key</li>
                <li>Juurdepääsu loomiseks sisest API võti siia</li>
              </ol>
            </Section>
            {t('reports.api_key')}
            <FormInput
              label="API Key"
              hideLabel={true}
              name="apiKey"
            ></FormInput>
          </Section>
          <Section>
            <Button>Edasi</Button>
            <Button appearance="secondary">Tühista</Button>
          </Section>
        </Track>
      </Drawer>
    </>
  )
}

export default ReportsPage
