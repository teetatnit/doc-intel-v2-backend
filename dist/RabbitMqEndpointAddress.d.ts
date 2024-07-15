export declare class RabbitMqHostAddress {
    host: string;
    port?: number;
    virtualHost: string;
    heartbeat?: number;
    protocol: string;
    constructor(settings: HostSettings);
    static parseVirtualHost(url: URL): string;
    static parse(address: string): RabbitMqHostAddress;
    toUrl(): URL;
    toString(): string;
}
export interface HostSettings {
    host: string;
    virtualHost: string;
    port?: number;
    ssl?: boolean;
    heartbeat?: number;
}
export declare class RabbitMqEndpointAddress {
    hostAddress: RabbitMqHostAddress;
    name: string;
    durable: boolean;
    autoDelete: boolean;
    exchangeType?: string;
    bindToQueue: boolean;
    queueName?: string;
    constructor(hostAddress: RabbitMqHostAddress, settings: EndpointSettings);
    static parseHostPathAndEntityName(url: URL): [string, string];
    static parse(hostAddress: RabbitMqHostAddress, address: string): RabbitMqEndpointAddress;
    toUrl(): URL;
    toString(): string;
}
export interface EndpointSettings {
    durable?: boolean;
    autoDelete?: boolean;
    exchangeType?: string;
    name: string;
    bindToQueue?: boolean;
    queueName?: string;
}
