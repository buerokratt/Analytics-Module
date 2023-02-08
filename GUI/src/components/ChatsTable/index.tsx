import { createColumnHelper, PaginationState, CellContext } from '@tanstack/react-table'
import { format } from 'date-fns'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineRemoveRedEye } from 'react-icons/md'
import { getLinkToChat } from '../../resources/api-constants'
import { Chat } from '../../types/chat'
import Button from '../Button'
import Card from '../Card'
import DataTable from '../DataTable'
import Icon from '../Icon'
import Track from '../Track'

type Props = {
  dataSource: Chat[]
}

const ChatsTable = (props: Props) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [chats, setChats] = useState<Chat[]>([])

  const columnHelper = createColumnHelper<Chat>()
  const { t } = useTranslation()

  useEffect(() => {
    const fetchChats = async () => {
      setChats(props.dataSource)
    }
    fetchChats().catch(console.error)
  }, [props.dataSource])

  const dateTimeFormat = (props: CellContext<Chat, string>) =>
    format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss')

  const chatColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
      }),
      columnHelper.accessor('comment', {
        header: t('feedback.comment') || '',
      }),
      columnHelper.accessor('created', {
        header: t('feedback.startTime') || '',
        cell: dateTimeFormat,
      }),
      columnHelper.accessor('ended', {
        header: t('feedback.endTime') || '',
        cell: dateTimeFormat,
      }),
      columnHelper.display({
        id: 'detail',
        cell: (props) => (
          <a href={getLinkToChat(props.row.original?.id)}>
            <Button appearance="text">
              <Track>
                <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'} />} />
                {t('feedback.view')}
              </Track>
            </Button>
          </a>
        ),
        meta: {
          size: '1%',
        },
      }),
    ],
    [],
  )

  return (
    <Card>
      <DataTable
        data={chats}
        columns={chatColumns}
        pagination={pagination}
        setPagination={setPagination}
      />
    </Card>
  )
}

export default ChatsTable
