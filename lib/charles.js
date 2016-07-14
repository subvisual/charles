require('dotenv').config();

var Botkit = require('botkit');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config/charles.json', 'utf8'));

var controller = Botkit.slackbot(config);
var charles = controller.spawn({
  incoming_webhook: {
    url: process.env.INCOMING_WEBHOOK_URL
  }
});

var triggers = [];

charles.addTrigger = function(trigger, callback) {
  triggers.push({"trigger": trigger, "callback": callback});
}

controller.setupWebserver(process.env.PORT, function(err, express_webserver) {
  controller.createWebhookEndpoints(express_webserver,
      [process.env.OUTGOING_WEBHOOK_TOKEN]);
});

controller.on('outgoing_webhook', function(bot, msg){
  triggers.forEach(function(tuple) {
    if(tuple.trigger.test(msg.text))
      tuple.callback(bot, msg);
  });
})

module.exports = {
  charles: charles
};
