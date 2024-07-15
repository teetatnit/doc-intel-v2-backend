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
    exports.MessageContext = void 0;
    var MessageContext = /** @class */ (function () {
        function MessageContext() {
        }
        return MessageContext;
    }());
    exports.MessageContext = MessageContext;
});
//# sourceMappingURL=messageContext.js.map