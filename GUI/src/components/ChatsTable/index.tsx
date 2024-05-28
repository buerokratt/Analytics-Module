import { createColumnHelper, PaginationState, CellContext, SortingState } from '@tanstack/react-table';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { getLinkToChat } from '../../resources/api-constants';
import { Chat } from '../../types/chat';
import { formatDate } from '../../util/charts-utils';
import Button from '../Button';
import Card from '../Card';
import DataTable from '../DataTable';
import Icon from '../Icon';
import Track from '../Track';

type Props = {
  dataSource: Chat[];
  pagination?: PaginationState;
  sorting?: SortingState;
  setSorting?: (state: SortingState) => void;
  setPagination?: (state: PaginationState) => void;
};

const ChatsTable = (props: Props) => {
  const [chats, setChats] = useState<Chat[]>([]);

  const columnHelper = createColumnHelper<Chat>();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchChats = async () => {
      setChats(props.dataSource);
    };
    fetchChats().catch(console.error);
  }, [props.dataSource]);

  const dateTimeFormat = (props: CellContext<Chat, string>) =>
    formatDate(new Date(props.getValue()), 'd. MMM yyyy HH:mm:ss');

  const feedbackViewButton = (props: any) => (
    <a href={getLinkToChat(props.row.original?.baseId ?? '')}>
      <Button appearance="text">
        <Track>
          <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'} />} />
          {t('feedback.view')}
        </Track>
      </Button>
    </a>
  );

  const chatColumns = useMemo(
    () => [
      columnHelper.accessor('baseId', {
        header: 'ID',
      }),
      columnHelper.accessor('feedback', {
        header: t('feedback.comment') ?? '',
      }),
      columnHelper.accessor('created', {
        header: t('feedback.startTime') ?? '',
        cell: dateTimeFormat,
      }),
      columnHelper.accessor('ended', {
        header: t('feedback.endTime') ?? '',
        cell: dateTimeFormat,
      }),
      columnHelper.accessor('rating', {
        header: t('chart.rating') ?? '',
      }),
      columnHelper.display({
        id: 'detail',
        cell: feedbackViewButton,
        meta: {
          size: '1%',
        },
      }),
    ],
    []
  );

  return (
    <Card>
      <DataTable
        data={chats}
        columns={chatColumns}
        pagination={props.pagination}
        sorting={props.sorting}
        sortable={true}
        setSorting={props.setSorting}
        setPagination={props.setPagination}
      />
    </Card>
  );
};

export default ChatsTable;
