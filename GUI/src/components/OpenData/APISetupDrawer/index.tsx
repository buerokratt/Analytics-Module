import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CgSpinner } from 'react-icons/cg'
import { openDataSettings } from '../../../resources/api-constants'
import { ODPSettings } from '../../../types/reports'
import Button from '../../Button'
import Drawer from '../../Drawer'
import { FormInput } from '../../FormElements'
import Section from '../../Section'
import { ToastContext } from '../../Toast/ToastContext'
import Track from '../../Track'

type Props = {
  onClose: (settings: ODPSettings) => void
  isDrawerVisible: boolean
}

const APISetupDrawer = ({ onClose, isDrawerVisible }: Props) => {
  const [isVerifyingSettings, setIsVerifyingSettings] = useState(false)
  const { t } = useTranslation()
  const { register, handleSubmit, reset } = useForm()
  const toast = useContext(ToastContext)

  const onSubmit = (d: any) => {
    setIsVerifyingSettings(true)
    putSettings(d.apiKey, d.apiKeyId, d.orgId)
  }

  const onSubmitError = (err: any) => {
    toast.open({
      type: 'error',
      title: t('reports.save_configuration_failed'),
      message: t('reports.check_input')
    })
  }

  useEffect(() => {
    if (!isDrawerVisible) reset()
  }, [isDrawerVisible])

  const putSettings = async (apiKey: string, keyId: string, orgId: string) => {
    try {
      const result = await axios.post(openDataSettings(), { apiKey, keyId, orgId })
      if (!result.data.response) {
        toast.open({
          type: 'error',
          title: t('reports.incorrect_apikey_title'),
          message: t('reports.incorrect_apikey_message'),
        })
      } else {
        toast.open({
          type: 'success',
          title: t('reports.correct_apikey_title'),
          message: t('reports.correct_apikey_message'),
        })
        onClose(result.data.response)
      }
    } catch {
      toast.open({
        type: 'error',
        title: t('reports.incorrect_apikey_title'),
        message: t('reports.incorrect_apikey_message'),
      })
    } finally {
      setIsVerifyingSettings(false)
    }
  }

  return (
    <Track
      direction="vertical"
      justify="between"
      style={{ height: '100%' }}
    >
      {isVerifyingSettings && (
        <Track
          direction="vertical"
          style={{ height: '300px' }}
          justify="center"
        >
          <CgSpinner
            className="spinner"
            size={32}
          />
          <p>{t('reports.verifying')}</p>
        </Track>
      )}
      {!isVerifyingSettings && (
        <form onSubmit={handleSubmit(onSubmit, onSubmitError)}>
          <Section>
            <Section>
              <ol>
                <li>
                  {t('reports.create_account')}
                  &nbsp;
                  <a href={process.env.REACT_APP_OPENDATAPORT_URL} target="_blank" rel="noreferrer">
                    {process.env.REACT_APP_OPENDATAPORT_URL}
                  </a>
                  &nbsp;
                  {t('reports.and_connect_org')}
                </li>
                <li>{t('reports.create_apikey_settings')}</li>
              </ol>
            </Section>

            <p>{t('reports.api_key')}</p>
            <FormInput
              label="API Key"
              hideLabel={true}
              {...register('apiKey', { required: true })}
            />
            <p>{t('reports.api_key_id')}</p>
            <FormInput
              label="API Key ID"
              hideLabel={true}
              {...register('apiKeyId', { required: true })}
            />
            <p>{t('reports.org_id')}</p>
            <FormInput
              label="Organization ID"
              hideLabel={true}
              {...register('orgId', { required: true })}
            />
          </Section>
          <Section>
            <Track
              gap={10}
              justify="end"
            >
              <Button type="submit">{t('global.save')}</Button>
              <Button
                appearance="secondary"
                type="reset"
              >
                {t('global.cancel')}
              </Button>
            </Track>
          </Section>
        </form>
      )}
    </Track>
  )
}

export default APISetupDrawer
