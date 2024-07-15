(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RabbitMqEndpointAddress = exports.RabbitMqHostAddress = void 0;
    var RabbitMqHostAddress = /** @class */ (function () {
        function RabbitMqHostAddress(settings) {
            var _a;
            this.host = settings.host;
            this.virtualHost = settings.virtualHost;
            this.port = settings.port;
            if (settings.ssl) {
                this.protocol = 'amqps:';
                if (!this.port)
                    this.port = 5671;
            }
            else
                this.protocol = 'amqp:';
            this.heartbeat = (_a = settings.heartbeat) !== null && _a !== void 0 ? _a : 60;
        }
        RabbitMqHostAddress.parseVirtualHost = function (url) {
            var path = url.pathname;
            if (path === null || path.match(/^ *$/))
                return '/';
            if (path === '/')
                return '/';
            var split = path.lastIndexOf('/');
            if (split > 0)
                return decodeURIComponent(path.substr(1, split - 1));
            return decodeURIComponent(path.substr(1));
        };
        RabbitMqHostAddress.parse = function (address) {
            var url = new URL(address);
            if (!url)
                throw new Error("Invalid host address: " + address);
            var ssl;
            var port;
            switch (url.protocol) {
                case 'rabbitmq:':
                case 'amqp:':
                    ssl = false;
                    break;
                case 'rabbitmqs:':
                case 'amqps:':
                    ssl = true;
                    port = 5671;
                    break;
                default:
                    throw new Error("Invalid protocol: " + url.protocol);
            }
            var host = url.host;
            if (url.port && url.port !== '')
                port = +url.port;
            if (port === 5671)
                ssl = true;
            var virtualHost = RabbitMqHostAddress.parseVirtualHost(url);
            var heartbeat = 60;
            url.searchParams.forEach(function (value, key) {
                switch (key.toLowerCase()) {
                    case 'heartbeat':
                        heartbeat = +value;
                        break;
                    case 'ttl':
                        break;
                    case 'prefetch':
                        break;
                    default:
                        break;
                }
            });
            return new RabbitMqHostAddress({ host: host, port: port, virtualHost: virtualHost, heartbeat: heartbeat, ssl: ssl });
        };
        RabbitMqHostAddress.prototype.toUrl = function () {
            var url = new URL(this.protocol + "//" + this.host);
            if (this.port && this.port !== 5672)
                url.port = this.port.toString();
            url.pathname = this.virtualHost === '/' ? '/' : "/" + encodeURIComponent(this.virtualHost);
            if (this.heartbeat)
                url.searchParams.append('heartbeat', this.heartbeat.toString());
            return url;
        };
        RabbitMqHostAddress.prototype.toString = function () {
            return this.toUrl().toString();
        };
        return RabbitMqHostAddress;
    }());
    exports.RabbitMqHostAddress = RabbitMqHostAddress;
    var RabbitMqEndpointAddress = /** @class */ (function () {
        function RabbitMqEndpointAddress(hostAddress, settings) {
            var _a, _b, _c, _d;
            this.hostAddress = hostAddress;
            this.name = settings.name;
            this.durable = (_a = settings.durable) !== null && _a !== void 0 ? _a : true;
            this.autoDelete = (_b = settings.autoDelete) !== null && _b !== void 0 ? _b : false;
            this.exchangeType = (_c = settings.exchangeType) !== null && _c !== void 0 ? _c : 'fanout';
            this.bindToQueue = (_d = settings.bindToQueue) !== null && _d !== void 0 ? _d : false;
            this.queueName = settings.queueName;
        }
        RabbitMqEndpointAddress.parseHostPathAndEntityName = function (url) {
            var path = url.pathname;
            if (path === null || path.match(/^ *$/))
                return ['/', ''];
            if (path === '/')
                return ['/', ''];
            var split = path.lastIndexOf('/');
            if (split > 0)
                return [decodeURIComponent(path.substr(1, split - 1)), path.substr(split + 1)];
            return ['/', decodeURIComponent(path.substr(1))];
        };
        RabbitMqEndpointAddress.parse = function (hostAddress, address) {
            var url = new URL(address);
            if (!url)
                throw new Error("Invalid host address: " + address);
            var name;
            var bindToQueue = false;
            switch (url.protocol) {
                case 'rabbitmq:':
                case 'amqp:':
                case 'rabbitmqs:':
                case 'amqps:':
                    var _a = RabbitMqEndpointAddress.parseHostPathAndEntityName(url), _ = _a[0], entityName = _a[1];
                    name = entityName;
                    break;
                case 'queue':
                    name = url.pathname;
                    bindToQueue = true;
                    break;
                case 'exchange':
                    name = url.pathname;
                    break;
                default:
                    throw new Error("Invalid protocol: " + url.protocol);
            }
            var settings = { name: name };
            url.searchParams.forEach(function (value, key) {
                switch (key.toLowerCase()) {
                    case 'temporary':
                        settings.autoDelete = value === 'true';
                        settings.durable = value !== 'true';
                        break;
                    case 'type':
                        settings.exchangeType = value;
                        break;
                    case 'bind':
                        settings.bindToQueue = true;
                        break;
                    case 'queue':
                        settings.queueName = decodeURIComponent(value);
                        break;
                    case 'durable':
                        settings.autoDelete = value === 'true';
                        break;
                    case 'autodelete':
                        settings.autoDelete = value === 'true';
                        break;
                    default:
                        break;
                }
            });
            return new RabbitMqEndpointAddress(hostAddress, settings);
        };
        RabbitMqEndpointAddress.prototype.toUrl = function () {
            var url = this.hostAddress.toUrl();
            url.pathname = url.pathname.endsWith('/') ? url.pathname + this.name : url.pathname + '/' + this.name;
            url.search = '';
            if (!this.durable && this.autoDelete)
                url.searchParams.append('temporary', 'true');
            else if (this.autoDelete)
                url.searchParams.append('autodelete', 'true');
            else if (!this.durable)
                url.searchParams.append('durable', 'false');
            if (this.bindToQueue)
                url.searchParams.append('bind', 'true');
            if (this.queueName)
                url.searchParams.append('queue', encodeURIComponent(this.queueName));
            return url;
        };
        RabbitMqEndpointAddress.prototype.toString = function () {
            return this.toUrl().toString();
        };
        return RabbitMqEndpointAddress;
    }());
    exports.RabbitMqEndpointAddress = RabbitMqEndpointAddress;
});
//# sourceMappingURL=RabbitMqEndpointAddress.js.map