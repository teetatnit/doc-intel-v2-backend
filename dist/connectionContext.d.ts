import { Connection } from 'amqplib';
import { RabbitMqHostAddress } from './RabbitMqEndpointAddress';
export interface ConnectionContext {
    connection: Connection;
    hostAddress: RabbitMqHostAddress;
}
export declare class ConnectionContext implements ConnectionContext {
    connection: Connection;
    hostAddress: RabbitMqHostAddress;
    constructor(connection: Connection, hostAddress: RabbitMqHostAddress);
}
