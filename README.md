# [![ScPrime Logo](https://scpri.me/imagestore/primelogo_text_400x74.png](http://scpri.me/) Nodejs Wrapper

[![Build Status](https://api.travis-ci.org/420coupe/Nodejs-SiaPrime.svg?branch=master)](https://travis-ci.org/420coupe/Nodejs-SiaPrime)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![devDependency Status](https://david-dm.org/420coupe/Nodejs-Siaprime/dev-status.svg)](https://david-dm.org/420coupe/Nodejs-SiaPrime#info=devDependencies)
[![dependencies Status](https://david-dm.org/420coupe/Nodejs-SiaPrime.svg)](https://david-dm.org/420coupe/Nodejs-SiaPrime#info=dependencies)
[![license:mit](https://img.shields.io/badge/license-mit-blue.svg)](https://opensource.org/licenses/MIT)

# A Highly Efficient Decentralized Storage Network

This is a [Nodejs](https://nodejs.org/) wrapper for
[ScPrime](https://gitlab.com/scpcorp/scprime). Use it in your apps to easily
interact with the ScPrime storage network via function calls instead of manual http
requests.

## Prerequisites

- [node & npm (version 5.9.0+ recommended)](https://nodejs.org/download/)

## Installation

```
npm install siaprime.js
```

## Example Usage

```js
import { connect } from 'siaprime.js'

// Using promises...
// connect to an already running SiaPrime daemon on localhost:4280 and print its version
connect('localhost:4280')
  .then((spd) => {
    spd.call('/daemon/version').then((version) => console.log(version))
  })
  .catch((err) => {
    console.error(err)
  })

// Or ES7 async/await
async function getVersion() {
  try {
    const spd = await connect('localhost:4280')
    const version = await spd.call('/daemon/version')
    console.log('spd has version: ' + version)
  } catch (e) {
    console.error(e)
  }
}

```
You can also forgo using `connect` and use `call` directly by providing an API address as the first parameter:

```js
import { call } from 'siaprime.js'

async function getVersion(address) {
  try {
    const version = await call(address, '/daemon/version')
    return version
  } catch (e) {
    console.error('error getting ' + address + ' version: ' + e.toString())
  }
}

console.log(getVersion('10.0.0.1:4280'))
```

`siaprime.js` can also launch a spd instance given a path on disk to the `spd` binary.  `launch` takes an object defining the flags to use as its second argument, and returns the `child_process` object.  You are responsible for keeping track of the state of this `child_process` object, and catching any errors `launch` may throw.

```js
import { launch } from 'siaprime.js'

try {
  // Flags are passed in as an object in the second argument to `launch`.
  // if no flags are passed, the default flags will be used.
  const spdProcess = launch('/root/go/bin/spd', {
    'modules': 'cgehmrtw',
    'profile': true,
  })
  // spdProcess is a ChildProcess class.  See https://nodejs.org/api/child_process.html#child_process_class_childprocess for more information on what you can do with it.
  spdProcess.on('error', (err) => console.log('spd encountered an error ' + err))
} catch (e) {
  console.error('error launching spd: ' + e.toString())
}
```

The call object passed as the first argument into call() are funneled directly
into the [`request`](https://github.com/request/request) library, so checkout
[their options](https://github.com/request/request#requestoptions-callback) to
see how to access the full functionality of [SiaPrime's
API](https://gitlab.com/SiaPrime/Sia/blob/master/doc/API.md)

```js
spd.call({
  url: '/consensus/block',
  method: 'GET',
  qs: {
    height: 0
  }
})
```

Should log something like:

```bash
null { block:
 { parentid: '0000000000000000000000000000000000000000000000000000000000000000',
   nonce: [ 0, 0, 0, 0, 0, 0, 0, 0 ],
   timestamp: 1433600000,
   minerpayouts: null,
   transactions: [ [Object] ] } }
```
