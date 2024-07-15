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
    exports.ConnectionContext = void 0;
    var ConnectionContext = /** @class */ (function () {
        function ConnectionContext(connection, hostAddress) {
            this.connection = connection;
            this.hostAddress = hostAddress;
        }
        return ConnectionContext;
    }());
    exports.ConnectionContext = ConnectionContext;
});
//# sourceMappingURL=connectionContext.js.map