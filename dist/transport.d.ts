/// <reference types="node" />
import { SendContext } from './sendContext';
import { MessageMap } from './serialization';
import { SendEndpoint } from './sendEndpoint';
import { ConfirmChannel, Connection } from 'amqplib';
import EventEmitter from 'events';
import { Bus } from './bus';
import { ConnectionContext } from './connectionContext';
import { ChannelContext } from './channelContext';
export interface SendEndpointArguments {
    exchange?: string;
    queue?: string;
    routingKey?: string;
    durable?: boolean;
    autodelete?: boolean;
    exchangeType?: string;
}
export interface Transport {
    /**
     * Returns a send endpoint,  using the specified arguments
     *
     * @returns SendEndpoint - which can then be used to send messages
     *
     * @param args - specified the exchange, queue, and routing key for the endpoint
     */
    sendEndpoint(args: SendEndpointArguments): SendEndpoint;
    send<T extends MessageMap>(exchange: string, routingKey: string, send: SendContext<T>): Promise<void>;
    on(event: 'channel', listener: (context: ChannelContext) => void): this;
}
export declare class Transport extends EventEmitter implements Transport {
    protected connection?: Connection;
    protected channel?: ConfirmChannel;
    protected bus: Bus;
    private pendingPublishQueue;
    private readonly serializer;
    constructor(bus: Bus);
    onConnect(context: ConnectionContext): Promise<void>;
    private basicPublish;
}
