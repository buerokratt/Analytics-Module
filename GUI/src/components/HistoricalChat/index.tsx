import {FC, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import clsx from 'clsx';
import {ReactComponent as BykLogoWhite} from '../../assets/logo-white.svg';
import {BACKOFFICE_NAME, Chat as ChatType, CHAT_EVENTS} from '../../types/chat';
import {Message} from '../../types/message';
import ChatMessage from './ChatMessage';
import './HistoricalChat.scss';
import {analyticsApi} from '../services/api';
import ChatEvent from '../ChatEvent';
import {AUTHOR_ROLES} from '../../util/constants';

type ChatProps = {
    chat: ChatType;
    header_link?: string;
    trigger: boolean;
    onChatStatusChange: (event: string) => void;
    onCommentChange: (comment: string) => void;
    selectedStatus: string | null;
};

type GroupedMessage = {
    name: string;
    title: string;
    type: string;
    messages: Message[];
};

const chatStatuses = [
    CHAT_EVENTS.ACCEPTED,
    CHAT_EVENTS.CLIENT_LEFT_FOR_UNKNOWN_REASONS,
    CHAT_EVENTS.CLIENT_LEFT_WITH_ACCEPTED,
    CHAT_EVENTS.CLIENT_LEFT_WITH_NO_RESOLUTION,
    CHAT_EVENTS.HATE_SPEECH,
    CHAT_EVENTS.OTHER,
    CHAT_EVENTS.RESPONSE_SENT_TO_CLIENT_EMAIL,
];

const HistoricalChat: FC<ChatProps> = ({
                                           chat,
                                           header_link,
                                           trigger,
                                           selectedStatus,
                                           onChatStatusChange,
                                           onCommentChange,
                                       }) => {
    const {t} = useTranslation();
    const chatRef = useRef<HTMLDivElement>(null);
    const [messageGroups, setMessageGroups] = useState<GroupedMessage[]>([]);
    const [messagesList, setMessagesList] = useState<Message[]>([]);

    useEffect(() => {
        const initializeComponent = () => {
            setMessageGroups([]);
            getMessages();
        };

        initializeComponent();
    }, []);

    useEffect(() => {
        getMessages();
    }, [chat]);

    const getMessages = async () => {
        if (!chat.id) return;
        const {data: res} = await analyticsApi.post('agents/chats/messages/all', {
            chatId: chat.id,
        });
        setMessagesList(res.response);
    };

    const endUserFullName =
        chat.endUserFirstName !== '' && chat.endUserLastName !== ''
            ? `${chat.endUserFirstName} ${chat.endUserLastName}`
            : t('global.anonymous');

    useEffect(() => {
        if (!messagesList) return;
        let groupedMessages: GroupedMessage[] = [];
        messagesList.forEach((message) => {
            const lastGroup = groupedMessages[groupedMessages.length - 1];
            if (
                lastGroup &&
                lastGroup.type === AUTHOR_ROLES.BACKOFFICE_USER &&
                lastGroup.messages.at(-1) &&
                message.event === CHAT_EVENTS.READ
            ) {
                lastGroup.messages.push(message);
                return;
            }
            if (lastGroup?.type === message.authorRole) {
                if (
                    !message.event ||
                    message.event.toLowerCase() === CHAT_EVENTS.GREETING ||
                    message.event.toLowerCase() === CHAT_EVENTS.WAITING_VALIDATION ||
                    message.event.toLowerCase() === CHAT_EVENTS.APPROVED_VALIDATION
                ) {
                    lastGroup.messages.push({
                        ...message,
                        content:
                            message.event === CHAT_EVENTS.WAITING_VALIDATION
                                ? t('chat.waiting_validation').toString()
                                : message.content,
                    });
                } else {
                    groupedMessages.push({
                        name: '',
                        type: 'event',
                        title: '',
                        messages: [{...message}],
                    });
                }
            } else {
                const isBackOfficeUser = message.authorRole === 'backoffice-user'
                    ? `${message.authorFirstName} ${message.authorLastName}`
                    : BACKOFFICE_NAME.DEFAULT;
                groupedMessages.push({
                    name:
                        message.authorRole === 'end-user'
                            ? endUserFullName
                            : isBackOfficeUser,
                    type: message.authorRole,
                    title: message.csaTitle ?? '',
                    messages: [{...message}],
                });
            }
        });

        setMessageGroups(groupedMessages);
    }, [messagesList, endUserFullName]);

    useEffect(() => {
        if (!chatRef.current || !messageGroups) return;
        chatRef.current.scrollIntoView({block: 'end', inline: 'end'});
    }, [messageGroups]);

    const isEvent = (group: GroupedMessage) => {
        return (
            group.type === 'event' ||
            group.name.trim() === '' ||
            (!group.messages[0].content && group.messages[0].event)
        );
    };

    return (
        <div className="historical-chat">
            <div className="historical-chat__body">
                {header_link && (
                    <div className={'header-link'}>{header_link}</div>
                )}
                <div className="historical-chat__group-wrapper">
                    {messageGroups?.map((group, index) => (
                        <div
                            className={clsx([
                                'historical-chat__group',
                                `historical-chat__group--${group.type}`,
                            ])}
                            key={`${group.name}-${index}`}
                        >
                            {isEvent(group) ? (
                                <ChatEvent message={group.messages[0]}/>
                            ) : (
                                <>
                                    <div className="historical-chat__group-initials">
                                        {group.type === 'buerokratt' || group.type === 'chatbot' ? (
                                            <BykLogoWhite height={24}/>
                                        ) : (
                                            <>
                                                {group.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()}
                                            </>
                                        )}
                                    </div>
                                    <div className="historical-chat__group-name">
                                        {group.name}
                                        {
                                            group.title.length > 0 && (
                                                <div className="title">{group.title}</div>
                                            )
                                        }
                                    </div>
                                    <div className="historical-chat__messages">
                                        {group.messages.map((message, i) => (
                                            <ChatMessage message={message} key={`${message.id ?? ''}-${i}`}/>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    <div id="anchor" ref={chatRef}></div>
                </div>
            </div>
            <div id="anchor" ref={chatRef}></div>
        </div>
    );
};

export default HistoricalChat;
