var async = require('async');
var Estimote = require('bleacon').Estimote;
var charles = require('./charles.js').charles;

var logError = function(err) {
  console.log("[ERR]: " + err);
};

var beacons = [];

Estimote.discoverAll(function(estimote) {
  async.series([
    function(next) {
      estimote.on('disconnect', function() {
        console.log('BEACON DISCONNECTED.');
      });

      console.log('CONNECTING...');
      estimote.connectAndSetup(next);
    },
    function(next) {
      console.log('PAIRING...');
      estimote.pair(next);
    },
    function(next) {
      beacons.push(estimote);
    }
  ]);
});

var calcTemperature = function() {
  var temperature = 0;
  var beaconCount = 0;

  // Turn the saved beacons into an async#series compatible function
  var callbacks = beacons.map(function(beacon) {
    return function(callback) {
      beacon.readTemperature(function(err, t) {
        callback(null, t);
      })
    };
  });

  return new Promise(function(resolve, reject) {
    async.series(callbacks, function(err, results) {

      // Sum up the total temperature
      var total = results.reduce(function(acc, val) {
        return acc + val;
      }, 0);

      // Average the beacon temperature
      if(callbacks.length > 0)
        resolve(total / callbacks.length);
      else
        reject(0);
    });
  });
};

// Trigger Charles
charles.addTrigger(/temperature/, function(bot, msg) {
  var temperature = calcTemperature().then(function(val) {
    bot.replyPublic(msg, "According to my data, the current temperature is " + val.toFixed(1) + "ºC");
  }).catch(function(reason) {
    bot.replyPublic(msg, "I'm sorry, I can't fulfill that request right now");
  });
});
