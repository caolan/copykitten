# copykitten.js

```
    /\/\
( =( ^-^)=
 \(  ⊃C⊃
      Copy Kitten
```

_Tiny immutable JSON data structures (< 1kb gzip)_

This is a minimal library, designed specifically for
JSON-compatible values: Strings, Numbers, Booleans, null, Objects, and Arrays.
For a wider selection of immutable data structures with less naive
implementations, see [Immutable.js][immutable-js].

Copy Kitten manipulates JSON data and returns an updated copy; the original data is
preserved. A reference to a Copy Kitten result will always return the same
value. Use this to write easy-to-understand code and optimise
top-down rendering (e.g. [Redux][redux]).


## Data conversion

```javascript
// JSON value -> immutable
var immutable = copykitten.toImmutable({example: 'value'})

// Immutable value -> JSON string
JSON.stringify(immutable)

// Immutable value -> JSON object
immutable.toJSON();
```

## API

* [toImmutable](#toImmutable)
* [isImmutable](#isImmutable)
* [FrozenObject](#FrozenObject)
  * [set(key, value)](#FrozenObject_set)
  * [remove(key)](#FrozenObject_remove)
  * [merge(props)](#FrozenObject_merge)
  * [deepMerge(props)](#FrozenObject_deepMerge)
  * [update(f)](#FrozenObject_update)
  * [thaw()](#FrozenObject_thaw)
  * [toJSON()](#FrozenObject_toJSON)
* [FrozenArray](#FrozenArray)
  * [push(element1, ..., elementN)](#FrozenArray_push)
  * [pop()](#FrozenArray_pop)
  * [unshift(element1, ..., elementN)](#FrozenArray_unshift)
  * [shift()](#FrozenArray_shift)
  * [sort()](#FrozenArray_sort)
  * [splice(start, deleteCount, item1, item2, ...)](#FrozenArray_splice)
  * [slice(begin, end)](#FrozenArray_slice)
  * [every(callback)](#FrozenArray_every)
  * [filter(callback)](#FrozenArray_filter)
  * [forEach(callback)](#FrozenArray_forEach)
  * [indexOf(searchElement)](#FrozenArray_indexOf)
  * [join()](#FrozenArray_join)
  * [lastIndexOf(searchElement)](#FrozenArray_lastIndexOf)
  * [map(callback)](#FrozenArray_map)
  * [reduce(callback)](#FrozenArray_reduce)
  * [reduceRight(callback)](#FrozenArray_reduceRight)
  * [some(callback)](#FrozenArray_some)

<a name="toImmutable"></a>

### toImmutable(value)

Converts `value` to an immutable value. Basic types (string, number,
boolean, null) are untouched, objects and arrays are converted to
FrozenObject and FrozenArray types respectively.

```javascript
var data = copykitten.toImmutable({
    name: 'Kitten'
});
```

<a name="isImmutable"></a>

### isImmutable(value)

Returns true for string, number, boolean, null, undefined,
FrozenObject and FrozenArray. Otherwise returns false.

```javascript
copykitten.isImmutable("string")  // true
copykitten.isImmutable(1234)  // true
copykitten.isImmutable(true)  // true
copykitten.isImmutable(null)  // true

copykitten.isImmutable({name: 'Kitten'})  // false

var data = copykitten.toImmutable({name: 'Kitten'});
copykitten.isImmutable(data)  // true
```

<a name="FrozenObject"></a>

### FrozenObject

Represents a JSON-style object (e.g. {hello: 'world'}) which has been
frozen and made immutable.

This constructor should not be called directly.

<a name="FrozenObject_set"></a>

#### set(key, value)

Returns a new copy of the FrozenObject with the property `key` set to
`value`. The value is first converted to an immutable (including deep
references) before being set on the newly returned FrozenObject.

```javascript
var a = copykitten.toImmutable({name: 'Kitten'});
var b = data.set('status', 'sleepy');

// a is now {name: 'Kitten'}
// b is now {name: 'Kitten', status: 'sleepy'}
```

<a name="FrozenObject_remove"></a>

#### remove(key)

Returns a new copy of the FrozenObject with the property `key`
removed.

```javascript
var a = copykitten.toImmutable({name: 'Kitten', toy: 'ball'});
var b = a.remove('toy');

// a is now {name: 'Kitten', toy: 'ball'}
// b is now {name: 'Kitten'}
```

<a name="FrozenObject_merge"></a>

#### merge(props)

Returns a new copy of the FrozenObject including the properties and
values from the `props` object. Any values defined on `props` will be
converted to immutables first (including deep references).

```javascript
var a = copykitten.toImmutable({name: 'Kitten'});
var b = a.merge({status: 'hungry'});

// a is now {name: 'Kitten'}
// b is now {name: 'Kitten', status: 'hungry'}
```

<a name="FrozenObject_deepMerge"></a>

#### deepMerge(props)

Like [merge(props)](#FrozenObject_merge) but will recursively merge
nested objects.

```javascript
var a = copykitten.toImmutable({animal: {name: 'Kitten'}});
var b = a.deepMerge({animal: {status: 'hungry'}});

// a is now {animal: {name: 'Kitten'}}
// b is now {animal: {name: 'Kitten', status: 'hungry'}}
```

<a name="FrozenObject_update"></a>

#### update(f)

Calls the function `f` with a mutable copy of the current
FrozenObject, then returns an immutable version including any
modifications made by `f`.

```javascript
var a = copykitten.toImmutable({name: 'Kitten'});
var b = a.update(function (obj) {
    delete obj.name;
    obj.type = 'animal';
});

// a is now {name: 'Kitten'}
// b is now {type: 'animal'}
```

Only the current object is mutable, any nested properties will remain
immutable while `f` is being called.

<a name="FrozenObject_thaw"></a>

#### thaw()

Returns a mutable JSON data type for the current object. Any nested
properties will remain immutable.

```javascript
var obj = copykitten.toImmutable({name: 'Kitten'});
obj.thaw()  // => {name: 'Kitten'}
```

<a name="FrozenObject_toJSON"></a>

#### toJSON()

Converts the current object and all nested properties to their mutable
JSON data type representations.

```javascript
var obj = copykitten.toImmutable({name: 'Kitten'});
obj.toJSON()  // => {name: 'Kitten'}
```

<a name="FrozenArray"></a>

### FrozenArray

FrozenArray extends FrozenObject. In addition to the FrozenObject
methods, it provides immutable implementations of most Array methods.
Some descriptions borrowed from the
[MDN Array documentation][mdn-arra].

This constructor should not be called directly.

<a name="FrozenArray_push"></a>

#### push(element1, ..., elementN)

Returns a new FrozenArray with `value` appended.

```javascript
var a = copykitten.toImmutable(['yarn', 'ball']);
var b = a.push('mouse');

// a is now ['yarn', 'ball']
// b is now ['yarn', 'ball', 'mouse']
```

<a name="FrozenArray_pop"></a>

#### pop()

Returns a new FrozenArray with the last item removed.

```javascript
var a = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var b = a.pop();

// a is now ['yarn', 'ball', 'mouse']
// b is now ['yarn', 'ball']
```

__Note:__ does not return the popped element, just the updated array.

<a name="FrozenArray_unshift"></a>

#### unshift([element1[, ...[, elementN]]])

Returns a new FrozenArray with `value` prepended.

```javascript
var a = copykitten.toImmutable(['yarn', 'ball']);
var b = a.unshift('mouse');

// a is now ['yarn', 'ball']
// b is now ['mouse', 'yarn', 'ball']
```

<a name="FrozenArray_shift"></a>

#### shift()

Returns a new FrozenArray with the first item removed.

```javascript
var a = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var b = a.shift();

// a is now ['yarn', 'ball', 'mouse']
// b is now ['ball', 'mouse']
```

__Note:__ does not return the shifted element, just the updated array.

<a name="FrozenArray_sort"></a>

#### sort([compareFunction])

Returns a new, sorted FrozenArray.

```javascript
var a = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var b = a.sort();

// a is now ['yarn', 'ball', 'mouse']
// b is now ['ball', 'mouse', 'yarn']
```

<a name="FrozenArray_splice"></a>

#### splice(start, deleteCount[, item1[, item2[, ...]]])

Works as the Array.splice method. Returns a new FrozenArray updated by
adding and/or removing elements from the original.

```javascript
var a = copykitten.toImmutable(['yarn', 'ball']);
var b = a.splice(1, 1, 'mouse');

// a is now ['yarn', 'ball']
// b is now ['yarn', 'mouse']
```

<a name="FrozenArray_slice"></a>

#### slice([begin[, end]])

Returns a new FrozenArray including a portion of the original.

```javascript
var a = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var b = a.slice(1)

// a is now ['yarn', 'ball', 'mouse']
// b is now ['ball', 'mouse']
```

<a name="FrozenArray_every"></a>

#### every(callback[, thisArg])

Tests whether all elements in the FrozenArray pass the test
implemented by the provided function. Returns boolean.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var small = toys.every(function (toy) {
    return toy.length < 10;
});

// small == true
```

<a name="FrozenArray_filter"></a>

#### filter(callback[, thisArg])

Creates a new FrozenArray with all elements that pass the test implemented
by the provided function.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var tiny = toys.filter(function (toy) {
    return toy.length < 4;
});

// tiny is now ['ball']
```

<a name="FrozenArray_forEach"></a>

#### forEach(callback[, thisArg])

Executes a provided function once per FrozenArray element.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);

toys.forEach(function (toy) {
    console.log(toy);
});
```

<a name="FrozenArray_indexOf"></a>

#### indexOf(searchElement[, fromIndex = 0])

Returns the first index at which a given element can be found in the
FrozenArray, or -1 if it is not present.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
toys.indexOf('ball');  // => 1
```

<a name="FrozenArray_join"></a>

#### join([separator = ','])

Joins all elements of a FrozenArray into a string.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
toys.join(' and ');  // => 'yarn and ball and mouse'
```

<a name="FrozenArray_lastIndexOf"></a>

#### lastIndexOf(searchElement[, fromIndex = arr.length - 1])

Returns the last index at which a given element can be found in the
FrozenArray, or -1 if it is not present. The FrozenArray is searched
backwards, starting at fromIndex.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse', 'ball']);
toys.lastIndexOf('ball');  // => 3
```

<a name="FrozenArray_map"></a>

#### map(callback[, thisArg])

Creates a new FrozenArray with the results of calling a provided
function on every element in this FrozenArray.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var caps = toys.map(function (toy) {
    return toy.toUpperCase();
});

// caps is now ['YARN', 'BALL', 'MOUSE']
```

<a name="FrozenArray_reduce"></a>

#### reduce(callback[, initialValue])

Applies a function against an accumulator and each value of the
FrozenArray (from left-to-right) to reduce it to a single value.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var size = toys.reduce(function (count, toy) {
    return count + toy.length;
}, 0);

// size is now 13
```

<a name="FrozenArray_reduceRight"></a>

#### reduceRight(callback[, initialValue])

Applies a function against an accumulator and each value of the
FrozenArray (from right-to-left) has to reduce it to a single value.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var smallest = toys.reduceRight(function (min, toy) {
    if (toy.length < min.length) {
        return toy;
    }
    return min;
});

// smallest is now 'ball'
```

<a name="FrozenArray_some"></a>

#### some(callback[, thisArg])

Tests whether some element in the FrozenArray passes the test
implemented by the provided function.

```javascript
var toys = copykitten.toImmutable(['yarn', 'ball', 'mouse']);
var got_ball = toys.some(function (toy) {
    return toy === 'ball';
});

// got_ball == true
```


[immutable-js]: http://facebook.github.io/immutable-js/
[mdn-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[redux]: http://redux.js.org
