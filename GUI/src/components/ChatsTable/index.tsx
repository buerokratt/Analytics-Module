import {CellContext, createColumnHelper, PaginationState, SortingState} from '@tanstack/react-table';
import React, {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {MdOutlineRemoveRedEye} from 'react-icons/md';
import {BACKOFFICE_NAME, Chat} from '../../types/chat';
import {formatDate} from '../../util/charts-utils';
import Button from '../Button';
import Card from '../Card';
import DataTable from '../DataTable';
import Icon from '../Icon';
import Track from '../Track';
import Drawer from "../Drawer";
import HistoricalChat from "../HistoricalChat";
import './ChatsTable.scss';
import {useMutation} from "@tanstack/react-query";
import {analyticsApi} from "../services/api";

type Props = {
    dataSource: Chat[];
    startDate?: string;
    endDate?: string;
    pagination?: PaginationState;
    sorting?: SortingState;
    setSorting?: (state: SortingState) => void;
    setPagination?: (state: PaginationState) => void;
};

const ChatsTable = (props: Props) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    type CombinedRow = Chat & { firstName?: string; lastName?: string };
    const columnHelper = createColumnHelper<CombinedRow>();
    const {t} = useTranslation();

    useEffect(() => {
        const fetchChats = async () => {
            setChats(props.dataSource);
        };
        fetchChats().catch(console.error);
    }, [props.dataSource]);

    const dateTimeFormat = (props: CellContext<Chat, string>) =>
        formatDate(new Date(props.getValue()), 'd. MMM yyyy HH:mm:ss');

    const feedbackViewButton = (dataTableProps: any) => (
        <Button
            onClick={() => {
                getChatById.mutate(dataTableProps.row.original.baseId ?? '');
            }}
            appearance="text">
            <Track>
                <Icon icon={<MdOutlineRemoveRedEye color={'rgba(0,0,0,0.54)'}/>}/>
                {t('feedback.view')}
            </Track>
        </Button>
    );

    const getChatById = useMutation({
        mutationFn: (chatId: string) =>
            analyticsApi.post('chats/get', {
                chatId: chatId,
            }),
        onSuccess: (res: any) => {
            setSelectedChat(res.data.response);
        },
    });

    const chatColumns = useMemo(
        () => [
            columnHelper.accessor('baseId', {
                header: 'ID',
            }),
            columnHelper.accessor(
                (row) => row.firstName ?`${row.firstName ?? ''} ${row.lastName ?? ''}` : BACKOFFICE_NAME.DEFAULT,
                {
                    id: `name`,
                    header: t('chat.history.csaName') ?? '',
                }
            ),
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
                    size: '3%',
                    sticky: 'right'
                },
            }),
        ],
        []
    );

    return (

        <div className="card-drawer-container">
            <div className="card-wrapper">
                <Card isScrollable={true}>
                    <DataTable
                        data={chats}
                        columns={chatColumns}
                        selectedRow={(row) => row.original.baseId === selectedChat?.id}
                        pagination={props.pagination}
                        sorting={props.sorting}
                        sortable={true}
                        setSorting={props.setSorting}
                        setPagination={props.setPagination}
                    />
                </Card>
            </div>
            {selectedChat && (
                <div className="drawer-container">
                    <Drawer
                        title={
                            selectedChat.endUserFirstName !== '' && selectedChat.endUserLastName !== ''
                                ? `${selectedChat.endUserFirstName} ${selectedChat.endUserLastName}`
                                : t('global.anonymous')
                        }
                        onClose={() => setSelectedChat(null)}
                    >
                        <HistoricalChat
                            header_link={selectedChat.endUserUrl}
                            chat={selectedChat}
                            trigger={true}
                        />
                    </Drawer>
                </div>
            )}
        </div>
    );
};

export default ChatsTable;
