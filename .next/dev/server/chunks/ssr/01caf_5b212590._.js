module.exports = [
"[project]/shelfie-ease/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}
exports._ = _interop_require_wildcard;
}),
"[project]/shelfie-ease/node_modules/ts-custom-error/dist/custom-error.mjs [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomError",
    ()=>CustomError,
    "customErrorFactory",
    ()=>customErrorFactory
]);
function fixProto(target, prototype) {
    var setPrototypeOf = Object.setPrototypeOf;
    setPrototypeOf ? setPrototypeOf(target, prototype) : target.__proto__ = prototype;
}
function fixStack(target, fn) {
    if (fn === void 0) {
        fn = target.constructor;
    }
    var captureStackTrace = Error.captureStackTrace;
    captureStackTrace && captureStackTrace(target, fn);
}
var __extends = undefined && undefined.__extends || function() {
    var _extendStatics = function extendStatics(d, b) {
        _extendStatics = Object.setPrototypeOf || ({
            __proto__: []
        }) instanceof Array && function(d, b) {
            d.__proto__ = b;
        } || function(d, b) {
            for(var p in b){
                if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
            }
        };
        return _extendStatics(d, b);
    };
    return function(d, b) {
        if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        _extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
var CustomError = function(_super) {
    __extends(CustomError, _super);
    function CustomError(message, options) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message, options) || this;
        Object.defineProperty(_this, 'name', {
            value: _newTarget.name,
            enumerable: false,
            configurable: true
        });
        fixProto(_this, _newTarget.prototype);
        fixStack(_this);
        return _this;
    }
    return CustomError;
}(Error);
var __spreadArray = undefined && undefined.__spreadArray || function(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function customErrorFactory(fn, parent) {
    if (parent === void 0) {
        parent = Error;
    }
    function CustomError() {
        var args = [];
        for(var _i = 0; _i < arguments.length; _i++){
            args[_i] = arguments[_i];
        }
        if (!(this instanceof CustomError)) return new (CustomError.bind.apply(CustomError, __spreadArray([
            void 0
        ], args, false)))();
        parent.apply(this, args);
        Object.defineProperty(this, 'name', {
            value: fn.name || parent.name,
            enumerable: false,
            configurable: true
        });
        fn.apply(this, args);
        fixStack(this, CustomError);
    }
    return Object.defineProperties(CustomError, {
        prototype: {
            value: Object.create(parent.prototype, {
                constructor: {
                    value: CustomError,
                    writable: true,
                    configurable: true
                }
            })
        }
    });
}
;
 //# sourceMappingURL=custom-error.mjs.map
}),
];

//# sourceMappingURL=01caf_5b212590._.js.map