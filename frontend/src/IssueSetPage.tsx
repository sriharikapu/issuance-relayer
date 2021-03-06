import * as React from 'react';
import { IssuanceOrder, SignedIssuanceOrder } from 'setprotocol.js';
import { RouteProps } from 'react-router-dom';

import Box from 'grommet/components/Box';
import Notification from 'grommet/components/Notification';
import Distribution from 'grommet/components/Distribution';

import IssuanceOrderForm from './IssuanceOrderForm';
import { getSetProtocolInstance } from './setProtocol';
import { setMap } from './data/sets';
import { api } from './api';
import { BigNumber } from '0x.js';

export interface IssueSetPageState {
    isLoading: boolean;
    errorMessage: string;
}

class IssueSetPage extends React.Component<RouteProps, IssueSetPageState> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            errorMessage: '',
        };
    }
    public render(): React.ReactNode {
        const setId = this.props.match.params.setId;
        const set = setMap[setId];
        return (
            <Box>
                <Box>
                    <Box justify="center" align="center">
                        <IssuanceOrderForm
                            isLoading={this.state.isLoading}
                            setId={this.props.match.params.setId}
                            onSubmit={this.handleFormSubmit}
                        />
                    </Box>
                    {this.state.errorMessage && (
                        <Notification
                            closer={true}
                            message={this.state.errorMessage}
                            onClose={() => this.setState({ errorMessage: null })}
                            status="warning"
                        />
                    )}
                    <Box justify="center" align="center">
                        <Distribution
                            series={set.components.map(componentInfo => ({
                                value: +componentInfo.percent_of_set,
                                label: componentInfo.name,
                            }))}
                            units="%"
                        />
                    </Box>
                </Box>
            </Box>
        );
    }
    handleFormSubmit = async (issuanceOrder: IssuanceOrder): Promise<void> => {
        console.log(issuanceOrder);
        const {
            setAddress,
            quantity,
            requiredComponents,
            requiredComponentAmounts,
            makerAddress,
            makerToken,
            makerTokenAmount,
            expiration,
            relayerAddress,
            relayerToken,
            makerRelayerFee,
            takerRelayerFee,
            salt,
        } = issuanceOrder;
        this.setState({ isLoading: true });
        try {
            const setProtocol = getSetProtocolInstance();
            // await setProtocol.setUnlimitedTransferProxyAllowanceAsync(makerToken, { from: makerAddress });
            const signedIssuanceOrder: SignedIssuanceOrder = await setProtocol.orders.createSignedOrderAsync(
                setAddress,
                quantity,
                requiredComponents,
                requiredComponentAmounts,
                makerAddress,
                makerToken,
                makerTokenAmount,
                expiration,
                relayerAddress,
                relayerToken,
                makerRelayerFee,
                takerRelayerFee,
                salt,
            );
            await api.postMarketOrder(signedIssuanceOrder, new BigNumber(Infinity));
        } catch (e) {
            console.log(e);
            this.setState({ errorMessage: e.message });
        } finally {
            this.setState({ isLoading: false });
        }
    };
}

export default IssueSetPage;
