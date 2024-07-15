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
    exports.MessageType = void 0;
    var MessageType = /** @class */ (function () {
        function MessageType(name, ns) {
            this.name = name;
            this.ns = ns !== null && ns !== void 0 ? ns : MessageType.defaultNamespace;
        }
        MessageType.setDefaultNamespace = function (ns) {
            this.defaultNamespace = ns;
        };
        MessageType.prototype.toString = function () {
            return "urn:message:" + this.ns + ":" + this.name;
        };
        MessageType.prototype.toMessageType = function () {
            return [this.toString()];
        };
        MessageType.defaultNamespace = 'Messages';
        return MessageType;
    }());
    exports.MessageType = MessageType;
});
//# sourceMappingURL=messageType.js.map