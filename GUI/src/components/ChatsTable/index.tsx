import { createColumnHelper, PaginationState } from '@tanstack/react-table'
import { format } from 'date-fns'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineRemoveRedEye } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { getLinkToChat } from '../../resources/api-constants'
import { Chat } from '../../types/chat'
import Card from '../Card'
import DataTable from '../DataTable'
import Icon from '../Icon'
import Track from '../Track'

type Props = {
  dataSource: () => Promise<Chat[]>
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
      const result = await props.dataSource()
      setChats(result)
    }
    fetchChats().catch(console.error)
  }, [props.dataSource])

  const chatColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
      }),
      columnHelper.accessor('created', {
        header: t('feedback.startTime') || '',
        cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
      }),
      columnHelper.accessor('ended', {
        header: t('feedback.endTime') || '',
        cell: (props) => format(new Date(props.getValue()), 'd. MMM yyyy HH:ii:ss'),
      }),
      columnHelper.display({
        id: 'detail',
        cell: (props) => (
          <Link to={getLinkToChat(props.row.original?.id)}>
            <Track>
              <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'} />} />
              {t('feedback.view')}
            </Track>
          </Link>
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
      <DataTable data={chats} columns={chatColumns} pagination={pagination} setPagination={setPagination} />
    </Card>
  )
}

export default ChatsTable
