"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;
exports.isRunning = _isRunning2;
exports.agent = exports.hastingsToSiacoins = exports.siacoinsToHastings = exports.call = exports.launch = exports.makeRequest = exports.errCouldNotConnect = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _bignumber = _interopRequireDefault(require("bignumber.js"));

var _fs = _interopRequireDefault(require("fs"));

var _child_process = require("child_process");

var _path = _interopRequireDefault(require("path"));

var _request = _interopRequireDefault(require("request"));

var _http = _interopRequireDefault(require("http"));

// siaprime.js: a lightweight node wrapper for starting, and communicating with
// a SiaPrime daemon (spd).
var agent = new _http["default"].Agent({
  keepAlive: true,
  maxSockets: 20
}); // siaprime.js error constants

exports.agent = agent;
var errCouldNotConnect = new Error('could not connect to the SiaPrime daemon'); // SiaPrimecoin -> hastings unit conversion functions
// These make conversion between units of SiaPrime easy and consistent for developers.
// Never return exponentials from BigNumber.toString, since they confuse the API

exports.errCouldNotConnect = errCouldNotConnect;

_bignumber["default"].config({
  EXPONENTIAL_AT: 1e+9
});

_bignumber["default"].config({
  DECIMAL_PLACES: 30
});

var hastingsPerSiacoin = new _bignumber["default"]('10').toPower(24);

var siacoinsToHastings = function siacoinsToHastings(siacoins) {
  return new _bignumber["default"](siacoins).times(hastingsPerSiacoin);
};

exports.siacoinsToHastings = siacoinsToHastings;

var hastingsToSiacoins = function hastingsToSiacoins(hastings) {
  return new _bignumber["default"](hastings).dividedBy(hastingsPerSiacoin);
}; // makeRequest takes an address and opts and returns a valid request.js request
// options object.


exports.hastingsToSiacoins = hastingsToSiacoins;

var makeRequest = function makeRequest(address, opts) {
  var callOptions = opts;

  if (typeof opts === 'string') {
    callOptions = {
      url: opts
    };
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
}; // Call makes a call to the SiaPrime API at `address`, with the request options defined by `opts`.
// returns a promise which resolves with the response if the request completes successfully
// and rejects with the error if the request fails.


exports.makeRequest = makeRequest;

var _call = function call(address, opts) {
  return new Promise(function (resolve, reject) {
    var callOptions = makeRequest(address, opts);
    (0, _request["default"])(callOptions, function (err, res, body) {
      if (!err && (res.statusCode < 200 || res.statusCode > 299)) {
        reject(body);
      } else if (!err) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  });
}; // launch launches a new instance of spd using the flags defined by `settings`.
// this function can `throw`, callers should catch errors.
// callers should also handle the lifecycle of the spawned process.


exports.call = _call;

var launch = function launch(path, settings) {
  var defaultSettings = {
    'api-addr': 'localhost:4280',
    'host-addr': ':4282',
    'rpc-addr': ':4281',
    'authenticate-api': false,
    'disable-api-security': false
  };
  var mergedSettings = Object.assign(defaultSettings, settings);

  var filterFlags = function filterFlags(key) {
    return mergedSettings[key] !== false;
  };

  var mapFlags = function mapFlags(key) {
    return '--' + key + '=' + mergedSettings[key];
  };

  var flags = Object.keys(mergedSettings).filter(filterFlags).map(mapFlags);

  var spdOutput = function () {
    if (typeof mergedSettings['siaprime-directory'] !== 'undefined') {
      return _fs["default"].createWriteStream(_path["default"].join(mergedSettings['siaprime-directory'], 'spd-output.log'));
    }

    return _fs["default"].createWriteStream('spd-output.log');
  }();

  var opts = {};

  if (process.geteuid) {
    opts.uid = process.geteuid();
  }

  var spdProcess = (0, _child_process.spawn)(path, flags, opts);
  spdProcess.stdout.pipe(spdOutput);
  spdProcess.stderr.pipe(spdOutput);
  return spdProcess;
}; // isRunning returns true if a successful call can be to /gateway
// using the address provided in `address`.  Note that this call does not check
// whether the spd process is still running, it only checks if a SiaPrime API is
// reachable.


exports.launch = launch;

function _isRunning2(_x) {
  return _isRunning.apply(this, arguments);
} // spdWrapper returns an instance of a SiaPrime API configured with address.


function _isRunning() {
  _isRunning = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(address) {
    return _regenerator["default"].wrap(function _callee$(_context) {
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
            return _context.abrupt("return", true);

          case 6:
            _context.prev = 6;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", false);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 6]]);
  }));
  return _isRunning.apply(this, arguments);
}

var spdWrapper = function spdWrapper(address) {
  var spdAddress = address;
  return {
    call: function call(options) {
      return _call(spdAddress, options);
    },
    isRunning: function isRunning() {
      return _isRunning2(spdAddress);
    }
  };
}; // connect connects to a running spd at `address` and returns a spdWrapper object.


function connect(_x2) {
  return _connect.apply(this, arguments);
}

function _connect() {
  _connect = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(address) {
    var running;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _isRunning2(address);

          case 2:
            running = _context2.sent;

            if (running) {
              _context2.next = 5;
              break;
            }

            throw errCouldNotConnect;

          case 5:
            return _context2.abrupt("return", spdWrapper(address));

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _connect.apply(this, arguments);
}