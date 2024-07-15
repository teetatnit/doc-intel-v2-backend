import { ConsumeMessage, Options } from 'amqplib';
import { Bus } from './bus';
import { ConsumeContext } from './consumeContext';
import { MessageMap } from './serialization';
import { SendEndpoint } from './sendEndpoint';
import { SendEndpointArguments, Transport } from './transport';
import { MessageType } from './messageType';
import { RabbitMqEndpointAddress, RabbitMqHostAddress } from './RabbitMqEndpointAddress';
/**
 * Configure the receive endpoint, including any message handlers
 */
export interface ReceiveEndpointConfigurator {
    queueName: string;
    options: ReceiveEndpointOptions;
    handle<T extends MessageMap>(messageType: MessageType, listener: (message: ConsumeContext<T>) => void): this;
}
export interface ReceiveEndpoint {
    hostAddress: RabbitMqHostAddress;
    address: RabbitMqEndpointAddress;
    sendEndpoint(args: SendEndpointArguments): SendEndpoint;
}
export declare class ReceiveEndpoint extends Transport implements ReceiveEndpointConfigurator, ReceiveEndpoint {
    queueName: string;
    options: ReceiveEndpointOptions;
    handle<T extends Record<string, any>>(messageType: MessageType, listener: (message: ConsumeContext<T>) => void): this;
    private readonly _messageTypes;
    constructor(bus: Bus, queueName: string, cb?: (cfg: ReceiveEndpointConfigurator) => void, options?: ReceiveEndpointOptions);
    emitMessage(msg: ConsumeMessage): void;
    private onChannel;
    private configureTopology;
}
export interface ReceiveEndpointOptions extends Options.AssertQueue, Options.AssertExchange, Options.Consume {
    prefetchCount: number;
    globalPrefetch: boolean;
    exclusive?: boolean;
    durable?: boolean;
    autoDelete?: boolean;
    arguments?: any;
    messageTtl?: number;
    expires?: number;
    deadLetterExchange?: string;
    deadLetterRoutingKey?: string;
    maxLength?: number;
    maxPriority?: number;
}
export declare const defaultReceiveEndpointOptions: ReceiveEndpointOptions;
