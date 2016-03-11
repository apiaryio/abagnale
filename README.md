# Abagnale

[![Build Status](http://img.shields.io/travis/apiaryio/abagnale/master.svg)](https://travis-ci.org/apiaryio/abagnale) [![Coverage Status](http://img.shields.io/coveralls/apiaryio/abagnale/master.svg)](https://coveralls.io/r/apiaryio/abagnale) [![NPM version](http://img.shields.io/npm/v/abagnale.svg)](https://www.npmjs.org/package/abagnale) [![License](http://img.shields.io/npm/l/abagnale.svg)](https://www.npmjs.org/package/abagnale)

A library to forge IDs for elements in [Refract](https://github.com/refractproject/refract-spec#refract) data structures. Data structures can come from [MSON](https://github.com/apiaryio/mson#markdown-syntax-for-object-notation) or other input sources.

Abagnale attempts to give all elements within the structure a unique ID, even for elements it does not know. It accomplishes this by crawling the element contents and looking for structures that look like other elements.

Along with unique IDs it also attempts to give each element a unique URI fragment that is safe to use in a URL and based on the element's unique ID. This can be found in a link relation called `uri-fragment`.

See the [test output](https://github.com/apiaryio/abagnale/tree/master/test/output) directory for examples of generated IDs and URI fragments.

It is named after [Frank Abagnale](https://en.wikipedia.org/wiki/Frank_Abagnale), one of the most notorious tricksters ever known. He forged several fake IDs, a pilots license with which he flew over a million miles, faked being a college professor, worked as a fake chief resident pediatrician, and worked in the Louisiana State Attorney General's office with a fake degree from Harvard before being caught.

## Installation & Usage

This project is available via `npm`:

```sh
npm install abagnale
```

There are two ways to use the module: either via module-level methods or by instantiating a class instance.

```js
import abagnale, {Abagnale} from 'abagnale';

// Input should be an array of refract elements
const input = [/* ... */];

// Module method
abagnale.forge(input, {separator: '.'});

// Class method
let instance = new Abagnale({separator: '.'});
instance.forge(input);
```

### Available Options
The following options can be set:

Name           | Description                                        | Default
-------------- | -------------------------------------------------- | -------
`separator`    | Character to denote path segments                  | `.`
`uriSeparator` | Character to denote path segments in URI fragments | `/`

### Notable Missing Features

The following list of features in no particular order are known to be missing or cause issues. Please feel free to open a pull request with new features and fixes based on this list! *wink wink nudge nudge* :beers:

* Elements in `meta` are not yet given IDs
* Elements in `attributes` are not yet given IDs

## Reference

### `abagnale.Abagnale([options])`

Create a new instance of the `Abagnale` class, which can be used to forge IDs for refract elements.

```js
import {Abagnale} from 'abagnale';

const instance = new Abagnale({separator: '.'});

// Now you can use it!
abagnale.forge([/* input array of elements */]);

// It is also possible to clear the element id cache, essentially resetting
// the instance. After doing this, the instance will generate IDs that have
// already been generated, which can be useful when processing a new unrelated
// document.
abagnale.cache = {};
```

### `abagnale.forge(structures, options)`

This is a module-level shortcut that instantiates an `Abagnale` class with `options` and then calls `forge(structures)` on it. The structures are modified in-place and returned.

```js
import abagnale from 'abagnale';

abagnale.forge([/* input array of elements */], {separator: '.'});
```

## License

Copyright &copy; 2016 Apiary, Inc. MIT licensed.
