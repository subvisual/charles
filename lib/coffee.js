var charles = require('./charles.js').charles;

var msgs = [
  "lolno.",
  "What gives? You do it.",
  "As if."
];

charles.addTrigger(/brew.*coffee/, function(bot, msg) {
  bot.replyPublic(msg, msgs[Math.floor(Math.random() * msgs.length)]);
});

