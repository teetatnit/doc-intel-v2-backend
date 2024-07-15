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
    exports.delay = void 0;
    function delay(ms) {
        var handle;
        var promise = function () {
            return new Promise(function (resolve) {
                handle = setTimeout(resolve, ms);
                return handle;
            });
        };
        return { promise: promise, cancel: function () { return clearTimeout(handle); } };
    }
    exports.delay = delay;
});
//# sourceMappingURL=util.js.map