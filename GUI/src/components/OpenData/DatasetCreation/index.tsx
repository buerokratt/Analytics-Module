import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CgSpinner } from 'react-icons/cg';
import * as yup from 'yup';
import i18n from '../../../i18n';
import { editScheduledReport, getOpenDataValues, openDataDataset } from '../../../resources/api-constants';
import { ODPValues } from '../../../types/reports';
import Button from '../../Button';
import Card from '../../Card';
import { FormDatepicker, FormInput, FormSelect, FormTextarea } from '../../FormElements';
import FormSelectMultiple from '../../FormElements/FormSelectMultiple';
import { ToastContext } from '../../context/ToastContext';
import Track from '../../Track';

import './styles.scss';
import { request, Methods } from '../../../util/axios-client';

type AccessType = NonNullable<'public' | 'protected' | 'private' | undefined>;
type UpdateIntervalUnitType = NonNullable<'day' | 'week' | 'month' | 'quarter' | 'year' | 'never' | undefined>;

type DatasetCreationProps = {
  metrics: string[];
  start: string;
  end: string;
  existingDataset: boolean | any;
  onClose: () => void;
};

const dataSetSchema = yup
  .object({
    nameEt: yup.string().required().max(120),
    nameEn: yup.string().required().max(120),
    descriptionEt: yup.string().required().max(1500),
    descriptionEn: yup.string().required().max(1500),
    maintainer: yup.string().required().max(500),
    maintainerEmail: yup.string().email().required(),
    regions: yup.array().of(yup.object({ id: yup.number().min(1).required() })),
    keywords: yup.array().of(yup.object({ id: yup.number().min(1).required() })),
    categories: yup.array().of(yup.object({ id: yup.number().min(1).required() })),
    updateIntervalUnit: yup.string().oneOf(['day', 'week', 'month', 'quarter', 'year', 'never']).required(),
    dataFrom: yup.date().default(new Date()).required(),
    updateIntervalFrequency: yup.number().default(1),
    access: yup.string().oneOf(['public', 'protected', 'private']).required(),
    licence: yup.object({
      id: yup.number().required(),
    }),
    cron_expression: yup.string(),
  })
  .required();

const DatasetCreation = ({ metrics, start, end, onClose, existingDataset }: DatasetCreationProps) => {
  const { register, handleSubmit, setValue, getValues, watch } = useForm({
    reValidateMode: 'onChange',
    defaultValues: dataSetSchema.cast(typeof existingDataset === 'boolean' ? {} : existingDataset, { assert: false }),
    resolver: yupResolver(dataSetSchema),
  });
  const [odpValues, setOdpValues] = useState<ODPValues>();
  const [loading, setLoading] = useState(false);
  const toast = useContext(ToastContext);

  const { t } = useTranslation();

  const onSubmit = async (data: any) => {
    if (loading) return;
    setLoading(true);

    data['regionIds'] = data['regions'].map((e: any) => e.id);
    data['keywordIds'] = data['keywords'].map((e: any) => e.id);
    data['categoryIds'] = data['categories'].map((e: any) => e.id);
    data['licenceId'] = data['licence'].id;

    try {
      if (existingDataset === true) {
        await request({ url: openDataDataset(), method: Methods.get, data: { ...data, metrics, start, end } });
      } else {
        await request({
          url: editScheduledReport(),
          method: Methods.post,
          data: { ...data, datasetId: existingDataset.datasetId },
        });
      }
      toast.open({
        type: 'success',
        title: t('reports.dataset_saved'),
        message: t('reports.dataset_saved_message'),
      });
      onClose();
    } catch {
      toast.open({ type: 'error', title: t('reports.save_dataset_failed'), message: t('reports.check_input') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const fetchValues = async () => {
    const lang = i18n.language;
    const result: any = await request({ url: getOpenDataValues(lang), method: Methods.post });
    const [keywords, categories, regions, licences] = result.response;
    setOdpValues({ keywords, categories, regions, licences });
  };

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
    );

  const getCronExpression = (interval: UpdateIntervalUnitType): string => {
    switch (interval) {
      case 'day':
        return '0 0 * * *';
      case 'week':
        return '0 0 * * 1';
      case 'month':
        return '0 0 1 * *';
      case 'quarter':
        return '0 0 1 */3 *';
      case 'year':
        return '0 0 1 1 *';
      default:
        return '';
    }
  };

  return (
    <Card>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="dataset"
      >
        <Track
          direction="vertical"
          gap={8}
          align="stretch"
        >
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
              {...register('keywords')}
              label={t('reports.keywords')}
              options={odpValues!.keywords.map(({ id, name }) => ({ value: id, label: name }))}
              defaultValue={getValues('keywords')?.map((v: any) => String(v.id))}
              onSelectionChange={(e) =>
                setValue(
                  'keywords',
                  e!.map((v) => ({ id: Number(v.value) }))
                )
              }
            />
            <FormSelectMultiple
              {...register('categories')}
              label={t('reports.categories')}
              options={odpValues!.categories.map(({ id, name }) => ({ value: id, label: name }))}
              defaultValue={getValues('categories')?.map((v: any) => String(v.id))}
              onSelectionChange={(e) =>
                setValue(
                  'categories',
                  e!.map((v) => ({ id: Number(v.value) }))
                )
              }
            />
          </Track>
          <Track
            gap={20}
            isMultiline={true}
          >
            <FormSelectMultiple
              {...register('regions')}
              label={t('reports.regions')}
              options={odpValues!.regions.map(({ id, name }) => ({ value: id, label: name }))}
              defaultValue={getValues('regions')?.map((v: any) => String(v.id))}
              onSelectionChange={(e) =>
                setValue(
                  'regions',
                  e!.map((v) => ({ id: Number(v.value) }))
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
            <FormDatepicker
              name="dataFrom"
              label={t('reports.dataFrom')}
              value={watch('dataFrom')}
              onBlur={() => {}}
              portalId="popup-overlay-root"
              onChange={(e) => setValue('dataFrom', e)}
            />
          </Track>
          <Track
            gap={20}
            isMultiline={true}
          >
            <FormSelect
              {...register('updateIntervalUnit')}
              label={t('reports.updateIntervalUnit')}
              options={['day', 'week', 'month', 'quarter', 'year', 'never'].map((v) => ({
                label: t('reports.interval_' + v),
                value: v,
              }))}
              defaultValue={getValues('updateIntervalUnit')}
              onSelectionChange={(e) => {
                const interval = e!.value as UpdateIntervalUnitType;
                setValue('updateIntervalUnit', interval);
                setValue('cron_expression', getCronExpression(interval));
              }}
            />
            {watch('updateIntervalUnit') !== undefined && (
              <div className="interval-explanation">{t('reports.explain_interval_' + watch('updateIntervalUnit'))}</div>
            )}
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
              onSelectionChange={(e) => setValue('access', e!.value as AccessType)}
            />
            <FormSelect
              {...register('licence.id')}
              label={t('reports.licence')}
              options={odpValues!.licences.map(({ id, name }) => ({ value: id, label: name }))}
              defaultValue={getValues('licence.id')}
              onSelectionChange={(e) => setValue('licence.id', Number(e!.value))}
            />
          </Track>
          <Track
            justify="end"
            style={{ paddingTop: '30px' }}
          >
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading && <CgSpinner className="spinner" />}
              {!loading && t('global.save')}
            </Button>
          </Track>
        </Track>
      </form>
      <div id="popup-overlay-root"></div>
    </Card>
  );
};

export default DatasetCreation;
