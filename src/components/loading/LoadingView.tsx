import { FC } from 'react';
import { Base, Column, LayoutProgressBar, Text } from '../../common';

interface LoadingViewProps
{
    percent: number;
}

export const LoadingView: FC<LoadingViewProps> = props =>
{
    const { percent = 0 } = props;

    return (
        <Column fullHeight position="relative" className="nitro-loading">
            <Base fullHeight className="container h-100">
                <Column fullHeight alignItems="center" justifyContent="end">
                    <Base className="connecting-duck" />
                    <Column size={ 6 } className="text-center py-4">
                        <Text fontSize={ 4 } variant="white" className="text-shadow">{ percent.toFixed() }%</Text>
                        <LayoutProgressBar progress={ percent } className="mt-2 large" />
                    </Column>
                </Column>
            </Base>
        </Column>
    );
};
