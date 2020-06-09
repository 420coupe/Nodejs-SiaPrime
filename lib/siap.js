'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.agent = exports.hastingsToSiacoins = exports.siacoinsToHastings = exports.call = exports.isRunning = exports.launch = exports.connect = exports.makeRequest = exports.errCouldNotConnect = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

// isRunning returns true if a successful call can be to /gateway
// using the address provided in `address`.  Note that this call does not check
// whether the spd process is still running, it only checks if a SiaPrime API is
// reachable.
var _isRunning = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(address) {
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_context.prev = 0;
						_context.next = 3;
						return _call(address, {
							url: '/gateway',
							timeout: 6e5 // 10 minutes
						});

					case 3:
						return _context.abrupt('return', true);

					case 6:
						_context.prev = 6;
						_context.t0 = _context['catch'](0);
						return _context.abrupt('return', false);

					case 9:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this, [[0, 6]]);
	}));

	return function _isRunning(_x) {
		return _ref.apply(this, arguments);
	};
}();

// spdWrapper returns an instance of a SiaPrime API configured with address.


// connect connects to a running spd at `address` and returns a spdWrapper object.
var connect = function () {
	var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(address) {
		var running;
		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_context2.next = 2;
						return _isRunning(address);

					case 2:
						running = _context2.sent;

						if (running) {
							_context2.next = 5;
							break;
						}

						throw errCouldNotConnect;

					case 5:
						return _context2.abrupt('return', spdWrapper(address));

					case 6:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this);
	}));

	return function connect(_x2) {
		return _ref2.apply(this, arguments);
	};
}();

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// siap.js: a lightweight node wrapper for starting, and communicating with
// a SiaPrime daemon (spd).
var agent = new _http2.default.Agent({
	keepAlive: true,
	maxSockets: 20
});

// siap.js error constants
var errCouldNotConnect = exports.errCouldNotConnect = new Error('could not connect to the SiaPrime daemon');

// SiaPrimecoin -> hastings unit conversion functions
// These make conversion between units of SiaPrime easy and consistent for developers.
// Never return exponentials from BigNumber.toString, since they confuse the API
_bignumber2.default.config({ EXPONENTIAL_AT: 1e+9 });
_bignumber2.default.config({ DECIMAL_PLACES: 30 });

var hastingsPerSiacoin = new _bignumber2.default('10').toPower(24);
var siacoinsToHastings = function siacoinsToHastings(siacoins) {
	return new _bignumber2.default(siacoins).times(hastingsPerSiacoin);
};
var hastingsToSiacoins = function hastingsToSiacoins(hastings) {
	return new _bignumber2.default(hastings).dividedBy(hastingsPerSiacoin);
};

// makeRequest takes an address and opts and returns a valid request.js request
// options object.
var makeRequest = exports.makeRequest = function makeRequest(address, opts) {
	var callOptions = opts;
	if (typeof opts === 'string') {
		callOptions = { url: opts };
	}
	callOptions.url = 'http://' + address + callOptions.url;
	callOptions.json = true;
	if (typeof callOptions.timeout === 'undefined') {
		callOptions.timeout = 10000;
	}
	callOptions.headers = {
		'User-Agent': 'SiaPrime-Agent'
	};
	callOptions.pool = agent;

	return callOptions;
};

// Call makes a call to the SiaPrime API at `address`, with the request options defined by `opts`.
// returns a promise which resolves with the response if the request completes successfully
// and rejects with the error if the request fails.
var _call = function _call(address, opts) {
	return new _promise2.default(function (resolve, reject) {
		var callOptions = makeRequest(address, opts);
		(0, _request2.default)(callOptions, function (err, res, body) {
			if (!err && (res.statusCode < 200 || res.statusCode > 299)) {
				reject(body);
			} else if (!err) {
				resolve(body);
			} else {
				reject(err);
			}
		});
	});
};

// launch launches a new instance of spd using the flags defined by `settings`.
// this function can `throw`, callers should catch errors.
// callers should also handle the lifecycle of the spawned process.
var launch = function launch(path, settings) {
	var defaultSettings = {
		'api-addr': 'localhost:4280',
		'host-addr': ':4282',
		'rpc-addr': ':4281',
		'authenticate-api': false,
		'disable-api-security': false
	};
	var mergedSettings = (0, _assign2.default)(defaultSettings, settings);
	var filterFlags = function filterFlags(key) {
		return mergedSettings[key] !== false;
	};
	var mapFlags = function mapFlags(key) {
		return '--' + key + '=' + mergedSettings[key];
	};
	var flags = (0, _keys2.default)(mergedSettings).filter(filterFlags).map(mapFlags);

	var spdOutput = function () {
		if (typeof mergedSettings['sia-directory'] !== 'undefined') {
			return _fs2.default.createWriteStream(_path2.default.join(mergedSettings['sia-directory'], 'spd-output.log'));
		}
		return _fs2.default.createWriteStream('spd-output.log');
	}();

	var opts = {};
	if (process.geteuid) {
		opts.uid = process.geteuid();
	}
	var spdProcess = (0, _child_process.spawn)(path, flags, opts);
	spdProcess.stdout.pipe(spdOutput);
	spdProcess.stderr.pipe(spdOutput);
	return spdProcess;
};var spdWrapper = function spdWrapper(address) {
	var spdAddress = address;
	return {
		call: function call(options) {
			return _call(spdAddress, options);
		},
		isRunning: function isRunning() {
			return _isRunning(spdAddress);
		}
	};
};exports.connect = connect;
exports.launch = launch;
exports.isRunning = _isRunning;
exports.call = _call;
exports.siacoinsToHastings = siacoinsToHastings;
exports.hastingsToSiacoins = hastingsToSiacoins;
exports.agent = agent;