import axios from 'axios'
import React, { useContext, useState } from 'react'
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
}

const APISetupDrawer = ({ onClose }: Props) => {
  const [isVerifyingSettings, setIsVerifyingSettings] = useState(false)
  const { t } = useTranslation()
  const { register, handleSubmit } = useForm()
  const toast = useContext(ToastContext)

  const onSubmit = (d: any) => {
    setIsVerifyingSettings(true)
    putSettings(d.apiKey, d.apiKeyId, d.orgId)
  }

  const putSettings = async (apiKey: string, keyId: string, orgId: string) => {
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
    setIsVerifyingSettings(false)
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
        <form onSubmit={handleSubmit(onSubmit)}>
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
              <Button type="submit">Edasi</Button>
              <Button
                appearance="secondary"
                type="reset"
              >
                Tühista
              </Button>
            </Track>
          </Section>
        </form>
      )}
    </Track>
  )
}

export default APISetupDrawer
