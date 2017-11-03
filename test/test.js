var assert = (typeof chai === 'undefined') ?
    require('assert'):
    chai.assert;

var copykitten = (typeof copykitten === 'undefined') ?
    require('../copykitten'):
    copykitten;


suite('isImmutable', function () {

    test('null', function () {
        assert.ok(copykitten.isImmutable(null));
    });
    test('undefined', function () {
        assert.ok(copykitten.isImmutable(undefined));
    });
    test('bool', function () {
        assert.ok(copykitten.isImmutable(true));
    });
    test('number', function () {
        assert.ok(copykitten.isImmutable(123));
    });
    test('string', function () {
        assert.ok(copykitten.isImmutable('foo'));
    });
    test('new String', function () {
        assert.ok(copykitten.isImmutable(new String('foo')));
    });
    test('new Boolean', function () {
        assert.ok(copykitten.isImmutable(new Boolean()));
    });
    test('new Number', function () {
        assert.ok(copykitten.isImmutable(new Number()));
    });
    test('new FrozenObject', function () {
        assert.ok(copykitten.isImmutable(new copykitten.FrozenObject()));
    });
    test('new FrozenArray', function () {
        assert.ok(copykitten.isImmutable(new copykitten.FrozenArray()));
    });

    test('{}', function () {
        assert.ok(!copykitten.isImmutable({}));
    });
    test('[]', function () {
        assert.ok(!copykitten.isImmutable([]));
    });
    test('new Object', function () {
        assert.ok(!copykitten.isImmutable(new Object()));
    });
    test('new Array', function () {
        assert.ok(!copykitten.isImmutable(new Array(16)));
    });
    test('new myObject', function () {
        function myObject() {};
        assert.ok(!copykitten.isImmutable(new myObject()));
    });

});

suite('toImmutable', function () {

    test('object - access properties', function () {
        var obj = copykitten.toImmutable({
            article: {
                author: {name: 'test'},
                title: 'example'
            }
        });
        assert.equal(obj.article.author.name, 'test');
        assert.equal(obj.article.title, 'example');
    });

    test('object - set properties', function () {
        var obj = copykitten.toImmutable({
            article: {
                author: {name: 'test'},
                title: 'example'
            }
        });
        obj.name = 'foo';
        assert.strictEqual(obj.name, undefined);
        obj.article.author.name = 'bar';
        assert.equal(obj.article.author.name, 'test');
    });

    test('object - set properties (strict mode)', function () {
        "use strict";
        var obj = copykitten.toImmutable({
            article: {
                author: {name: 'test'},
                title: 'example'
            }
        });
        assert.throws(function () {obj.name = 'foo';});
        assert.throws(function () {obj.article.author.name = 'bar';});
    });

});

suite('FrozenObject', function () {

    test('set - string', function () {
        var obj = copykitten.toImmutable({
            name: 'foo'
        });
        var obj2 = obj.set('name', 'bar');
        assert.strictEqual(obj.name, 'foo');
        assert.strictEqual(obj2.name, 'bar');
    });

    test('set - object', function () {
        var obj = copykitten.toImmutable({
            author: {
                name: 'foo'
            }
        });
        var obj2 = obj.set('author', {name: 'bar'});
        assert.strictEqual(obj.author.name, 'foo');
        assert.strictEqual(obj2.author.name, 'bar');
        assert.ok(copykitten.isImmutable(obj.author));
        assert.ok(copykitten.isImmutable(obj2.author));
        var obj3 = obj2.set('title', 'test');
        assert.equal(obj3.author, obj2.author);
        assert.notEqual(obj3.title, obj2.title);
    });

    test('remove', function () {
        var obj = copykitten.toImmutable({
            foo: 'bar',
            baz: 'qux'
        });
        var obj2 = obj.remove('foo');
        assert.deepEqual(obj.thaw(), {
            foo: 'bar',
            baz: 'qux'
        });
        assert.deepEqual(obj2.thaw(), {
            baz: 'qux'
        });
    });

    test('merge', function () {
        "use strict";
        var obj = copykitten.toImmutable({
            author: {
                name: 'foo'
            }
        });
        var obj2 = obj.merge({
            title: 'test',
            meta: {
                date: 'today'
            }
        });
        assert.strictEqual(obj.title, undefined);
        assert.equal(obj2.title, 'test');
        assert.ok(obj2.meta instanceof copykitten.FrozenObject);
        assert.equal(obj2.meta.date, 'today');
        assert.throws(function () {
            obj2.meta.date = 'test';
        });
    });

    test('deepMerge', function () {
        "use strict";
        var obj = copykitten.toImmutable({
            title: 'test',
            meta: {
                author: {
                    name: 'foo',
                    role: 'user'
                }
            },
            tags: [{id: 1, name: 'one'}, 2, 3, 4],
            foo: {a: 1},
            bar: ['bar'],
            a: null
        });
        var obj2 = obj.deepMerge({
            meta: {
                author: {
                    id: 123,
                    role: 'admin'
                },
                date: 'today'
            },
            other: {
                something: 'else'
            },
            tags: [{id: 1}],
            foo: ['foo'],
            bar: {b: 2},
            a: {test: true}
        });
        assert.deepEqual(JSON.parse(JSON.stringify(obj2)), {
            title: 'test',
            meta: {
                author: {
                    id: 123,
                    role: 'admin',
                    name: 'foo'
                },
                date: 'today'
            },
            other: {
                something: 'else'
            },
            tags: [{id: 1}],
            foo: ['foo'],
            bar: {b: 2},
            a: {test: true}
        });
    });

    test('JSON.stringify', function () {
        var obj = copykitten.toImmutable({
            arr: [1, 2, 3],
            author: {
                name: 'foo'
            }
        });
        assert.deepEqual(JSON.parse(JSON.stringify(obj)), {
            arr: [1, 2, 3],
            author: {
                name: 'foo'
            }
        });
    });

    test('toJSON (deep thaw)', function () {
        var obj = copykitten.toImmutable({
            a: {
                b: 123,
                c: [1,2,3]
            }
        });
        assert.deepEqual(obj.toJSON(), {
            a: {
                b: 123,
                c: [1,2,3]
            }
        });
        assert.ok(!(obj.toJSON().a.c instanceof copykitten.FrozenArray));
    });

    test('update', function () {
        var obj = copykitten.toImmutable({
            a: 1
        });
        var obj2 = obj.update(function (x) {
            x.b = 2;
            x.c = {d: 3};
        });
        assert.deepEqual(obj.thaw(), {a: 1});
        assert.deepEqual(obj2.toJSON(), {a: 1, b: 2, c: {d: 3}});
        assert.ok(obj2.c instanceof copykitten.FrozenObject);
    });

    test('thaw', function () {
        "use strict";
        var obj = copykitten.toImmutable({
            foo: {
                bar: 123
            }
        });
        assert.ok(obj instanceof copykitten.FrozenObject);
        var obj2 = obj.thaw();
        assert.ok(!(obj2 instanceof copykitten.FrozenObject));
        assert.ok(obj2 instanceof Object);
        obj2.test = 'asdf';
        assert.equal(obj2.test, 'asdf');
        // sub objects still frozen
        assert.ok(obj2.foo instanceof copykitten.FrozenObject);
        assert.throws(function () {
            obj2.foo.bar = 456;
        });
    });

});

suite('FrozenArray', function () {

    test('length property', function () {
        var arr = copykitten.toImmutable([1,2,3]);
        assert.equal(arr.length, 3);
        var desc1 = Object.getOwnPropertyDescriptor(arr, 'length');
        var desc2 = Object.getOwnPropertyDescriptor([1,2,3], 'length');
        assert.ok(!desc1.writable);
        assert.ok(desc2.writable);
        delete desc1.writable;
        delete desc2.writable;
        assert.deepEqual(desc1, desc2);
    });

    test('push', function () {
        var arr = copykitten.toImmutable([1,2,3]);
        var arr2 = arr.push(4);
        assert.deepEqual(arr.thaw(), [1,2,3]);
        assert.deepEqual(arr2.thaw(), [1,2,3,4]);
        assert.ok(arr instanceof copykitten.FrozenArray);
        assert.ok(arr2 instanceof copykitten.FrozenArray);
        assert.equal(arr2.length, 4);
    });

    test('pop', function () {
        var arr = copykitten.toImmutable([1,2,3]);
        var arr2 = arr.pop();
        assert.deepEqual(arr.thaw(), [1,2,3]);
        assert.deepEqual(arr2.thaw(), [1,2]);
        assert.equal(arr2.length, 2);
    });

    test('unshift', function () {
        var arr = copykitten.toImmutable([1,2,3]);
        var arr2 = arr.unshift(0);
        assert.deepEqual(arr.thaw(), [1,2,3]);
        assert.deepEqual(arr2.thaw(), [0,1,2,3]);
        assert.ok(arr instanceof copykitten.FrozenArray);
        assert.ok(arr2 instanceof copykitten.FrozenArray);
        assert.equal(arr2.length, 4);
    });

    test('shift', function () {
        var arr = copykitten.toImmutable([1,2,3]);
        var arr2 = arr.shift();
        assert.deepEqual(arr.thaw(), [1,2,3]);
        assert.deepEqual(arr2.thaw(), [2,3]);
        assert.equal(arr2.length, 2);
    });

    test('sort', function () {
        var arr = copykitten.toImmutable([3,1,4,2]);
        var arr2 = arr.sort();
        assert.deepEqual(arr.thaw(), [3,1,4,2]);
        assert.deepEqual(arr2.thaw(), [1,2,3,4]);
    });

    test('splice', function () {
        var arr = copykitten.toImmutable([1,2,3,4,5]);
        var arr2 = arr.splice(2, 2, 'test');
        assert.deepEqual(arr.thaw(), [1,2,3,4,5]);
        assert.deepEqual(arr2.thaw(), [1,2,'test',5]);
        assert.equal(arr.length, 5);
        assert.equal(arr2.length, 4);
    });

    test('slice', function () {
        var arr = copykitten.toImmutable([1,2,3,4,5]);
        var arr2 = arr.slice(2, 4);
        assert.deepEqual(arr.thaw(), [1,2,3,4,5]);
        assert.deepEqual(arr2.thaw(), [3,4]);
    });

    test('concat', function () {
        var arr = copykitten.toImmutable([1,2,3]);
        var arr2 = arr.concat([4,5]);
        assert.deepEqual(arr.thaw(), [1,2,3]);
        assert.deepEqual(arr2.thaw(), [1,2,3,4,5]);
        // concat an immutable
        var arr3 = arr.concat(copykitten.toImmutable([4,5]));
        assert.deepEqual(arr3.thaw(), [1,2,3,4,5]);
        // objects
        var arr4 = arr.concat('foo');
        assert.deepEqual(arr4.thaw(), [1,2,3,'foo']);
    });

    test('every', function () {
        var arr = copykitten.toImmutable([2,2,2]);
        assert.strictEqual(arr.every(function (x) {
            return x === 2;
        }), true);
        arr = copykitten.toImmutable([1,2,3]);
        assert.strictEqual(arr.every(function (x) {
            return x === 2;
        }), false);
    });

    test('filter', function () {
        var arr = copykitten.toImmutable([1,2,3,4]);
        assert.deepEqual(arr.filter(function (x) {
            return x % 2;
        }).thaw(), [1,3]);
    });

    test('forEach', function () {
        var arr = copykitten.toImmutable([1,2,3,4]);
        var calls = [];
        arr.forEach(function (x) {
            calls.push(x);
        });
        assert.deepEqual(calls, [1,2,3,4]);
    });

    test('indexOf', function () {
        var arr = copykitten.toImmutable([1,2,3,4,3,2,1]);
        assert.equal(arr.indexOf(3), 2);
    });

    test('join', function () {
        var arr = copykitten.toImmutable([1,2,3,4]);
        assert.equal(arr.join(" "), "1 2 3 4");
    });

    test('lastIndexOf', function () {
        var arr = copykitten.toImmutable([1,2,3,4,3,2,1]);
        assert.equal(arr.lastIndexOf(3), 4);
    });

    test('map', function () {
        var arr = copykitten.toImmutable([1,2,3,4]);
        var arr2 = arr.map(function (x) {
            return x * 2;
        });
        assert.deepEqual(arr2.thaw(), [2,4,6,8]);
    });

    test('reduce', function () {
        var arr = copykitten.toImmutable([1,2,3,4]);
        var calls = [];
        var total = arr.reduce(function (count, x) {
            calls.push(x);
            return count + x;
        }, 0);
        assert.deepEqual(calls, [1,2,3,4]);
        assert.equal(total, 10);
    });

    test('reduceRight', function () {
        var arr = copykitten.toImmutable([1,2,3,4]);
        var calls = [];
        var total = arr.reduceRight(function (count, x) {
            calls.push(x);
            return count + x;
        }, 0);
        assert.deepEqual(calls, [4,3,2,1]);
        assert.equal(total, 10);
    });

    test('some', function () {
        var arr = copykitten.toImmutable([1,2,3,4]);
        assert.strictEqual(arr.some(function (x) {
            return x > 2;
        }), true);
        arr = copykitten.toImmutable([1,2,3]);
        assert.strictEqual(arr.some(function (x) {
            return x > 10;
        }), false);
    });

    test('thaw', function () {
        "use strict";
        var obj = copykitten.toImmutable([
            {foo: 123},
            {bar: 456}
        ]);
        assert.ok(obj instanceof copykitten.FrozenArray);
        assert.ok(obj instanceof copykitten.FrozenObject);
        var obj2 = obj.thaw();
        assert.ok(!(obj2 instanceof copykitten.FrozenArray));
        assert.ok(!(obj2 instanceof copykitten.FrozenObject));
        assert.ok(Array.isArray(obj2));
        obj2[0] = 'asdf';
        assert.equal(obj2[0], 'asdf');
        // sub objects still frozen
        assert.ok(obj2[1] instanceof copykitten.FrozenObject);
        assert.throws(function () {
            obj2[1].bar = 456;
        });
    });

});
