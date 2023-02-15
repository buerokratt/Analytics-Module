import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { CgSpinner } from 'react-icons/cg'
import * as yup from 'yup'
import i18n from '../../../i18n'
import { getOpenDataValues } from '../../../resources/api-constants'
import { ODPValues } from '../../../types/reports'
import Button from '../../Button'
import { FormInput, FormSelect, FormTextarea } from '../../FormElements'
import FormSelectMultiple from '../../FormElements/FormSelectMultiple'
import Section from '../../Section'
import Track from '../../Track'

import './styles.scss'

const dataSetSchema = yup
  .object({
    nameEt: yup.string().required().max(120),
    nameEn: yup.string().required().max(120),
    descriptionEt: yup.string().required().max(1500),
    descriptionEn: yup.string().required().max(1500),
    maintainer: yup.string().required().max(500),
    maintainerEmail: yup.string().required(),
    regionIds: yup.array().of(yup.number()).min(1).required(),
    keywordIds: yup.array().of(yup.number()).min(1).required(),
    categoryIds: yup.array().of(yup.number()).min(1).required(),
    updateIntervalUnit: yup.string().oneOf(['day', 'week', 'month', 'quarter', 'year', 'never']).required(),
  })
  .required()

const DatasetCreation = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    reValidateMode: 'onChange',
    resolver: yupResolver(dataSetSchema),
  })
  const [odpValues, setOdpValues] = useState<ODPValues>()
  const { t } = useTranslation()
  const onSubmit = (d: any) => {
    console.log(d)
  }

  useEffect(() => {
    fetchValues()
  }, [])

  const fetchValues = async () => {
    const lang = i18n.language
    const result = await axios.get(getOpenDataValues(lang))
    const [keywords, categories, regions, licences] = result.data.response
    setOdpValues({ keywords, categories, regions, licences })
  }

  if (!odpValues)
    return (
      <Track
        justify="center"
        style={{ height: '200px' }}
      >
        <CgSpinner
          className="spinner"
          size="32"
        />
      </Track>
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      DatasetCreation
      <Track
        gap={20}
        isMultiline={true}
      >
        <FormInput
          {...register('nameEt')}
          label={t('reports.nameEt')}
        />

        <FormInput
          {...register('nameEn')}
          label={t('reports.nameEn')}
        />
      </Track>
      <Track
        gap={20}
        isMultiline={true}
      >
        <FormTextarea
          {...register('descriptionEt')}
          label={t('reports.descriptionEt')}
          onChange={(e) => setValue('descriptionEt', e.target.value)}
        />

        <FormTextarea
          {...register('descriptionEn')}
          label={t('reports.descriptionEn')}
          onChange={(e) => setValue('descriptionEn', e.target.value)}
        />
      </Track>
      <Track
        gap={20}
        isMultiline={true}
      >
        <FormSelectMultiple
          {...register('keywordIds')}
          label={t('reports.keywords')}
          options={odpValues!.keywords.map(({ id, name }) => ({ value: id, label: name }))}
          defaultValue={getValues('keywordIds')?.map((v: any) => String(v))}
          onSelectionChange={(e) =>
            setValue(
              'keywordIds',
              e!.map((v) => Number(v.value)),
            )
          }
        />
        <FormSelectMultiple
          {...register('categoryIds')}
          label={t('reports.categories')}
          options={odpValues!.categories.map(({ id, name }) => ({ value: id, label: name }))}
          defaultValue={getValues('categoryIds')?.map((v: any) => String(v))}
          onSelectionChange={(e) =>
            setValue(
              'categoryIds',
              e!.map((v) => Number(v.value)),
            )
          }
        />
      </Track>
      <Track
        gap={20}
        isMultiline={true}
      >
        <FormSelectMultiple
          {...register('regionIds')}
          label={t('reports.regions')}
          options={odpValues!.regions.map(({ id, name }) => ({ value: id, label: name }))}
          defaultValue={getValues('regionIds')?.map((v: any) => String(v))}
          onSelectionChange={(e) =>
            setValue(
              'regionIds',
              e!.map((v) => Number(v.value)),
            )
          }
        />
        <FormInput
          {...register('maintainer')}
          label={t('reports.maintainer')}
        />
      </Track>
      <Track
        gap={20}
        isMultiline={true}
      >
        <FormInput
          {...register('maintainerEmail')}
          label={t('reports.maintainerEmail')}
        />
      </Track>
      <Track
        gap={20}
        isMultiline={true}
      >
        <FormSelect
          {...register('updateIntervalUnit')}
          label={t('reports.updateIntervalUnit')}
          options={['day', 'week', 'month', 'quarter', 'year', 'never'].map((v) => ({ label: v, value: v }))}
          defaultValue={getValues('updateIntervalUnit')}
          onSelectionChange={(e) => setValue('updateIntervalUnit', e!.value)}
        />
        <div className='interval-explanation'>
          {t('reports.explain_interval_'+watch('updateIntervalUnit'))}
        </div>
      </Track>
      <Track
        gap={20}
        isMultiline={true}
      >
        <FormSelect
          {...register('access')}
          label={t('reports.access')}
          options={['public', 'protected', 'private'].map((v) => ({ label: v, value: v }))}
          defaultValue={getValues('access')}
          onSelectionChange={(e) => setValue('access', e!.value)}
        />
        <FormSelect
          {...register('licenceId')}
          label={t('reports.licence')}
          options={odpValues!.licences.map(({ id, name }) => ({ value: id, label: name }))}
          defaultValue={getValues('licenceId')}
          onSelectionChange={(e) => setValue('licenceId', Number(e!.value))}
        />
      </Track>
      <Track justify='end' style={{paddingTop: '30px'}}>
      <Button
        type="submit"
        onClick={handleSubmit(onSubmit)}
      >
        {t('reports.add')}
      </Button>
      </Track>
    </form>
  )
}

export default DatasetCreation
