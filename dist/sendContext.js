(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "guid-typescript", "./host"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SendContext = void 0;
    var guid_typescript_1 = require("guid-typescript");
    var host_1 = require("./host");
    var SendContext = /** @class */ (function () {
        function SendContext(message) {
            this.message = message;
            this.messageId = guid_typescript_1.Guid.create().toString();
            this.host = host_1.host();
        }
        return SendContext;
    }());
    exports.SendContext = SendContext;
});
//# sourceMappingURL=sendContext.js.map