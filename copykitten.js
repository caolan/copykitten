(function (global, factory) {
    typeof module !== 'undefined' ?
        module.exports = factory() :
        global.copykitten = factory();
}(this, function () {

    'use strict';

    var freeze = Object.freeze;
    var props = Object.getOwnPropertyNames;

    function isImmutable(v) {
        return v instanceof FrozenObject || !isObjectLike(v);
    }

    function isObjectLike(v) {
        return v instanceof Object &&
            !(v instanceof String) &&
            !(v instanceof Boolean) &&
            !(v instanceof Number);
    }

    function deepFreeze(v) {
        props(v).forEach(function (k) {
            v[k] = toImmutable(v[k]);
        });
        return freeze(v);
    }

    function toImmutable(v) {
        return isImmutable(v) ? v :
            deepFreeze(thaw(v, Array.isArray(v) ? FrozenArray : FrozenObject));
    }

    function FrozenObject() {}

    function merge(a, b) {
        props(b).forEach(function (k) {
            a[k] = b[k];
        });
        return a;
    }

    function thaw(source, constructor) {
        return merge(new (constructor || source.constructor), source);
    };

    function updater(f) {
        return function () {
            var obj = thaw(this);
            f.apply(obj, arguments);
            return deepFreeze(obj);
        };
    }

    FrozenObject.prototype.update = updater(function (f) {
        f.call(this, this);
    });

    FrozenObject.prototype.set = updater(function (k, v) {
        this[k] = v;
    });

    FrozenObject.prototype.remove = updater(function (k) {
        delete this[k];
    });

    FrozenObject.prototype.merge = updater(function (obj) {
        merge(this, obj);
    });

    FrozenObject.prototype.deepMerge = updater(function (obj) {
        var a = this;
        var b = obj;
        props(b).forEach(function (k) {
            if (typeof a[k] === 'object' &&
                typeof b[k] === 'object' &&
                !Array.isArray(b[k]) &&
                !(a[k] instanceof FrozenArray)) {
                a[k] = a[k].deepMerge(b[k]);
            }
            else {
                a[k] = b[k];
            }
        });
    });

    FrozenObject.prototype.thaw = function () {
        return thaw(this, Object);
    };

    function toJSON(v) {
        if (v instanceof FrozenObject) {
            v = v.thaw();
            props(v).forEach(function (k) {
                v[k] = toJSON(v[k]);
            });
        }
        return v;
    }

    FrozenObject.prototype.toJSON = function () {
        return toJSON(this);
    };

    function FrozenArray() {
        Object.defineProperty(this, 'length', {
            enumerable: false,
            configurable: false,
            writable: true,
            value: 0
        });
    }

    FrozenArray.prototype = new FrozenObject;
    FrozenArray.prototype.constructor = FrozenArray;

    FrozenArray.prototype.thaw = function () {
        return thaw(this, Array);
    };

    // mutating methods:
    'push pop unshift shift sort splice'.split(' ').forEach(function (name) {
        FrozenArray.prototype[name] = updater(Array.prototype[name]);
    });

    'slice every filter forEach indexOf join lastIndexOf map reduce reduceRight some'.split(' ').forEach(function (name) {
        FrozenArray.prototype[name] = function () {
            return toImmutable(Array.prototype[name].apply(this, arguments));
        };
    });

    FrozenArray.prototype.concat = updater(function () {
        for (var i = 0, len = arguments.length; i < len; i++) {
            var arg = arguments[i];
            if (Array.isArray(arg) || arg instanceof FrozenArray) {
                for (var j = 0, len2 = arg.length; j < len2; j++) {
                    this[this.length++] = arg[j];
                }
            }
            else {
                this[this.length++] = arg;
            }
        }
    });

    return {
        isImmutable: isImmutable,
        toImmutable: toImmutable,
        FrozenObject: FrozenObject,
        FrozenArray: FrozenArray
    };

}));

