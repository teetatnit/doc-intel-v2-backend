var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./serialization", "./sendEndpoint", "events", "./RabbitMqEndpointAddress"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Transport = void 0;
    var serialization_1 = require("./serialization");
    var sendEndpoint_1 = require("./sendEndpoint");
    var events_1 = __importDefault(require("events"));
    var RabbitMqEndpointAddress_1 = require("./RabbitMqEndpointAddress");
    var PendingPublish = /** @class */ (function () {
        function PendingPublish(exchange, routingKey, message, resolve, reject) {
            this.exchange = exchange;
            this.routingKey = routingKey;
            this.message = message;
            this.resolve = resolve;
            this.reject = reject;
        }
        return PendingPublish;
    }());
    var Transport = /** @class */ (function (_super) {
        __extends(Transport, _super);
        function Transport(bus) {
            var _this = _super.call(this) || this;
            _this.bus = bus;
            _this.setMaxListeners(0);
            _this.serializer = new serialization_1.JsonMessageSerializer();
            _this.pendingPublishQueue = new Array();
            bus.on('connect', function (context) { return _this.onConnect(context); });
            return _this;
        }
        Transport.prototype.sendEndpoint = function (args) {
            var _a, _b;
            if (!args.exchange && !args.queue)
                throw new Error('An exchange or a queue name must be specified');
            var exchange = (_a = args.exchange) !== null && _a !== void 0 ? _a : '';
            var routingKey = (_b = (args.exchange ? args.routingKey : args.queue)) !== null && _b !== void 0 ? _b : '';
            return new sendEndpoint_1.SendEndpoint(this, exchange, routingKey);
        };
        Transport.prototype.send = function (exchange, routingKey, send) {
            return __awaiter(this, void 0, void 0, function () {
                var destination, body;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            destination = exchange;
                            if (!destination || destination === '')
                                destination = routingKey;
                            send.destinationAddress = new RabbitMqEndpointAddress_1.RabbitMqEndpointAddress(this.bus.hostAddress, { name: destination }).toString();
                            body = this.serializer.serialize(send);
                            return [4 /*yield*/, this.basicPublish(exchange, routingKey, body)];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        Transport.prototype.onConnect = function (context) {
            return __awaiter(this, void 0, void 0, function () {
                var channel, pendingPublish, exchange, message, routingKey;
                var _this = this;
                return __generator(this, function (_a) {
                    //console.log("transport label ",_a.label);
                    switch (_a.label) {
                        case 0:
                            if (this.connection && this.connection === context.connection)
                                return [2 /*return*/];
                            this.connection = context.connection;
                            //console.log("transport connection:", this.connection)
                            return [4 /*yield*/, context.connection.createConfirmChannel()];
                        case 1:
                            try {
                                _a.sent();
                            } catch (e) {
                                console.log('e =', e);
                            }
                            channel = _a.sent();
                            //console.log('channel =', channel);
                            channel.on('error', function (err) {
                                console.error('Channel error', err.message);
                                console.log('Channel error =', err);
                            });
                            channel.on('close', function () {
                                _this.connection = undefined;
                                _this.channel = undefined;
                            });
                            this.channel = channel;
                            this.emit('channel', __assign(__assign({}, context), { channel: channel }));
                            _a.label = 2;
                        case 2:
                            if (!true) return [3 /*break*/, 4];
                            pendingPublish = this.pendingPublishQueue.shift();
                            if (!pendingPublish)
                                return [3 /*break*/, 4];
                            exchange = pendingPublish.exchange, message = pendingPublish.message, routingKey = pendingPublish.routingKey;
                            return [4 /*yield*/, this.basicPublish(exchange, routingKey, message)];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 2];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        Transport.prototype.basicPublish = function (exchange, routingKey, body) {
            return __awaiter(this, void 0, void 0, function () {
                var channel_1;
                var _this = this;
                return __generator(this, function (_a) {
                    if (this.channel) {
                        channel_1 = this.channel;
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var result = channel_1.publish(exchange, routingKey, body, { persistent: true }, function (err) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        setImmediate(function () { return resolve(result); });
                                    }
                                });
                            })];
                    }
                    else
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                _this.pendingPublishQueue.push(new PendingPublish(exchange, routingKey, body, resolve, reject));
                            })];
                    return [2 /*return*/];
                });
            });
        };
        return Transport;
    }(events_1.default));
    exports.Transport = Transport;
});
//# sourceMappingURL=transport.js.map