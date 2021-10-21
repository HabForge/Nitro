import { IssueInfoMessageEvent, ModeratorInitMessageEvent, RoomEngineEvent } from '@nitrots/nitro-renderer';
import { FC, useCallback } from 'react';
import { ModToolsEvent } from '../../events/mod-tools/ModToolsEvent';
import { ModToolsOpenRoomChatlogEvent } from '../../events/mod-tools/ModToolsOpenRoomChatlogEvent';
import { ModToolsOpenRoomInfoEvent } from '../../events/mod-tools/ModToolsOpenRoomInfoEvent';
import { ModToolsOpenUserChatlogEvent } from '../../events/mod-tools/ModToolsOpenUserChatlogEvent';
import { ModToolsOpenUserInfoEvent } from '../../events/mod-tools/ModToolsOpenUserInfoEvent';
import { CreateMessageHook, useRoomEngineEvent, useUiEvent } from '../../hooks';
import { useModToolsContext } from './context/ModToolsContext';
import { ModToolsActions } from './reducers/ModToolsReducer';

export const ModToolsMessageHandler: FC<{}> = props =>
{
    const { modToolsState = null, dispatchModToolsState = null } = useModToolsContext();
    const { openRooms = null, openRoomChatlogs = null, openUserChatlogs = null, openUserInfo = null, tickets= null } = modToolsState;
    
    const onModeratorInitMessageEvent = useCallback((event: ModeratorInitMessageEvent) =>
    {
        const parser = event.getParser();

        if(!parser) return;

        const data = parser.data;

        dispatchModToolsState({
            type: ModToolsActions.SET_INIT_DATA,
            payload: {
                settings: data
            }
        });

        dispatchModToolsState({
            type: ModToolsActions.SET_TICKETS,
            payload: {
                tickets: data.issues
            }
        });
        
        console.log(parser);   
    }, [dispatchModToolsState]);

    const onIssueInfoMessageEvent = useCallback((event: IssueInfoMessageEvent) =>
    {
        const parser = event.getParser();

        if(!parser) return;

        const newTickets = tickets ? Array.from(tickets) : [];
        const existingIndex = newTickets.findIndex( entry => entry.issueId === parser.issueData.issueId)
        
        if(existingIndex > -1)
        {
            newTickets[existingIndex] = parser.issueData;
        }
        else 
        {
            newTickets.push(parser.issueData);
        }

        dispatchModToolsState({
            type: ModToolsActions.SET_TICKETS,
            payload: {
                tickets: newTickets
            }
        })
    }, [dispatchModToolsState, tickets]);

    CreateMessageHook(ModeratorInitMessageEvent, onModeratorInitMessageEvent);
    CreateMessageHook(IssueInfoMessageEvent, onIssueInfoMessageEvent);

    const onRoomEngineEvent = useCallback((event: RoomEngineEvent) =>
    {
        switch(event.type)
        {
            case RoomEngineEvent.INITIALIZED:
                dispatchModToolsState({
                    type: ModToolsActions.SET_CURRENT_ROOM_ID,
                    payload: {
                        currentRoomId: event.roomId
                    }
                });
                return;
            case RoomEngineEvent.DISPOSED:
                dispatchModToolsState({
                    type: ModToolsActions.SET_CURRENT_ROOM_ID,
                    payload: {
                        currentRoomId: null
                    }
                });
                return;
        }
    }, [ dispatchModToolsState ]);

    useRoomEngineEvent(RoomEngineEvent.INITIALIZED, onRoomEngineEvent);
    useRoomEngineEvent(RoomEngineEvent.DISPOSED, onRoomEngineEvent);

    const onModToolsEvent = useCallback((event: ModToolsEvent) =>
    {
        switch(event.type)
        {
            case ModToolsEvent.OPEN_ROOM_INFO: {
                const castedEvent = (event as ModToolsOpenRoomInfoEvent);
                
                if(openRooms && openRooms.includes(castedEvent.roomId)) return;
                
                const rooms = openRooms || [];
                
                dispatchModToolsState({
                    type: ModToolsActions.SET_OPEN_ROOMS,
                    payload: {
                        openRooms: [...rooms, castedEvent.roomId]
                    }
                });
                return;
            }
            case ModToolsEvent.OPEN_ROOM_CHATLOG: {
                const castedEvent = (event as ModToolsOpenRoomChatlogEvent); 

                if(openRoomChatlogs && openRoomChatlogs.includes(castedEvent.roomId)) return;

                const chatlogs = openRoomChatlogs || [];

                dispatchModToolsState({
                    type: ModToolsActions.SET_OPEN_ROOM_CHATLOGS,
                    payload: {
                        openRoomChatlogs: [...chatlogs, castedEvent.roomId]
                    }
                });
                return;
            }
            case ModToolsEvent.OPEN_USER_INFO: {
                const castedEvent = (event as ModToolsOpenUserInfoEvent);

                if(openUserInfo && openUserInfo.includes(castedEvent.userId)) return;

                const userInfo = openUserInfo || [];

                dispatchModToolsState({
                    type: ModToolsActions.SET_OPEN_USERINFO,
                    payload: {
                        openUserInfo: [...userInfo, castedEvent.userId]
                    }
                });
                return;
            }
            case ModToolsEvent.OPEN_USER_CHATLOG: {
                const castedEvent = (event as ModToolsOpenUserChatlogEvent);

                if(openUserChatlogs && openUserChatlogs.includes(castedEvent.userId)) return;

                const userChatlog = openUserChatlogs || [];

                dispatchModToolsState({
                    type: ModToolsActions.SET_OPEN_USER_CHATLOGS,
                    payload: {
                        openUserChatlogs: [...userChatlog, castedEvent.userId]
                    }
                });
                return;
            }
        }
    }, [openRooms, dispatchModToolsState, openRoomChatlogs, openUserInfo, openUserChatlogs]);
    
    useUiEvent(ModToolsEvent.OPEN_ROOM_INFO, onModToolsEvent);
    useUiEvent(ModToolsEvent.OPEN_ROOM_CHATLOG, onModToolsEvent);
    useUiEvent(ModToolsEvent.OPEN_USER_INFO, onModToolsEvent);
    useUiEvent(ModToolsEvent.OPEN_USER_CHATLOG, onModToolsEvent);

    return null;
}
