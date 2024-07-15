export declare class MessageType {
    private static defaultNamespace;
    name: string;
    ns: string;
    constructor(name: string, ns?: string);
    static setDefaultNamespace(ns: string): void;
    toString(): string;
    toMessageType(): Array<string>;
}
