// Load everything in lib
var lib = require("path").join(__dirname, "lib");

require("fs").readdirSync(lib).forEach(function(file) {
  require("./lib/" + file);
});

