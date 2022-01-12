/* eslint-disable no-template-curly-in-string */
import { HabboClubLevelEnum, RoomCreateComposer } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState } from 'react';
import { GetConfiguration, GetSessionDataManager, LocalizeText } from '../../../../api';
import { Column } from '../../../../common/Column';
import { Flex } from '../../../../common/Flex';
import { Grid } from '../../../../common/Grid';
import { LayoutGridItem } from '../../../../common/layout/LayoutGridItem';
import { Text } from '../../../../common/Text';
import { BatchUpdates } from '../../../../hooks';
import { SendMessageHook } from '../../../../hooks/messages';
import { CurrencyIcon } from '../../../../views/shared/currency-icon/CurrencyIcon';
import { IRoomModel, RoomModels } from '../../common/RoomModels';
import { useNavigatorContext } from '../../context/NavigatorContext';

export const NavigatorRoomCreatorView: FC<{}> = props =>
{
    const [ maxVisitorsList, setMaxVisitorsList ] = useState<number[]>(null);
    const [ name, setName ] = useState<string>(null);
    const [ description, setDescription ] = useState<string>(null);
    const [ category, setCategory ] = useState<number>(null);
    const [ visitorsCount, setVisitorsCount ] = useState<number>(null);
    const [ tradesSetting, setTradesSetting ] = useState<number>(0);
    const [ selectedModelName, setSelectedModelName ] = useState<string>(RoomModels[0].name);
    const { navigatorState = null } = useNavigatorContext();
    const { categories = null } = navigatorState;

    const getRoomModelImage = (name: string) => GetConfiguration<string>('images.url') + `/navigator/models/model_${ name }.png`;

    const selectModel = (model: IRoomModel) =>
    {
        if(!model) return;

        if(model.clubLevel > GetSessionDataManager().clubLevel) return;

        setSelectedModelName(name);
    }

    const createRoom = () =>
    {
        if(!name || name.length < 3) return;

        SendMessageHook(new RoomCreateComposer(name, description, 'model_' + selectedModelName, Number(category), Number(visitorsCount), tradesSetting));
    }

    useEffect(() =>
    {
        if(!maxVisitorsList)
        {
            const list = [];

            for(let i = 10; i <= 100; i = i + 10) list.push(i);

            BatchUpdates(() =>
            {
                setMaxVisitorsList(list);
                setVisitorsCount(list[0]);
            });
        }
    }, [ maxVisitorsList ]);

    useEffect(() =>
    {
        if(categories) setCategory(categories[0].id);
    }, [ categories ]);

    return (
        <Column overflow="hidden">
            <Grid fullHeight={ false }>
                <Column size={ 6 } gap={ 1 }>
                    <Text>{ LocalizeText('navigator.createroom.roomnameinfo') }</Text>
                    <input type="text" className="form-control form-control-sm" onChange={ (e) => setName(e.target.value) } />
                </Column>
                <Column size={ 6 } gap={ 1 }>
                    <Text>{ LocalizeText('navigator.category') }</Text>
                    <select className="form-select form-select-sm" onChange={ (e) => setCategory(Number(e.target.value)) }>
                        { categories && categories.map(category =>
                            {
                                return <option key={ category.id } value={ category.id }>{ LocalizeText(category.name) }</option>
                            }) }
                    </select>
                </Column>
                <Column size={ 6 } gap={ 1 }>
                    <Text>{ LocalizeText('navigator.maxvisitors') }</Text>
                    <select className="form-select form-select-sm" onChange={ (e) => setVisitorsCount(Number(e.target.value)) }>
                        { maxVisitorsList && maxVisitorsList.map(value =>
                            {
                                return <option key={ value } value={ value }>{ value }</option>
                            }) }
                    </select>
                </Column>
                <Column size={ 6 } gap={ 1 }>
                    <Text>{ LocalizeText('navigator.tradesettings') }</Text>
                    <select className="form-select form-select-sm" onChange={ (e) => setTradesSetting(Number(e.target.value)) }>
                        <option value="0">{ LocalizeText('navigator.roomsettings.trade_not_allowed') }</option>
                        <option value="1">{ LocalizeText('navigator.roomsettings.trade_not_with_Controller') }</option>
                        <option value="2">{ LocalizeText('navigator.roomsettings.trade_allowed') }</option>
                    </select>
                </Column>
            </Grid>
            <Column gap={ 1 }>
                <Text>{ LocalizeText('navigator.createroom.roomdescinfo') }</Text>
                <input type="text" className="form-control form-control-sm" onChange={ (e) => setDescription(e.target.value) } />
            </Column>
            <Flex overflow="auto" gap={ 1 }>
                {
                    RoomModels.map(model =>
                        {
                            return (<LayoutGridItem fullHeight key={ model.name } onClick={ () => selectModel(model) } itemActive={ (selectedModelName === model.name) } overflow="unset" gap={ 0 } className="p-1" disabled={ (GetSessionDataManager().clubLevel < model.clubLevel) }>
                                <Flex fullHeight center overflow="hidden">
                                    <img alt="" src={ getRoomModelImage(model.name) } />
                                </Flex>
                                <Text bold>{ model.tileSize } { LocalizeText('navigator.createroom.tilesize') }</Text>
                                { model.clubLevel > HabboClubLevelEnum.NO_CLUB && <CurrencyIcon position="absolute" className="top-1 end-1" type="hc" /> }
                            </LayoutGridItem>);
                        })
                }
            </Flex>
            <button className="btn btn-success float-end" onClick={ () => createRoom() } disabled={ !name || name.length < 3 }>{ LocalizeText('navigator.createroom.create') }</button>
        </Column>
    );
}
