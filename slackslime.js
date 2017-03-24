
// original script by Francis Kim @ franciskim.co
// https://github.com/franciskim/slackslime

//--------
// imports
//--------

var _ = require('lodash');
var tmp = require('tmp');
var fs = require('fs');
var argv = require('yargs').argv;

var Wormhole = require('./Wormhole');

//------
// setup
//------

// create temporary directory for file uploads (obv. this is insecure, so please don't share sensitive info)
var tmpobj = tmp.dirSync({ template: '/tmp/tmp-slackslime-XXXXXXXXX' });
var tmpDir = tmpobj.name;

var wormholes = [];
var slackslime_settings;


if(!('configfile' in argv)) {
  // legacy format: nodejs slackslime.js [channel name] [RTM API token 1] [RTM API token 2] [RTM API token 3] [more tokens]
  // command line args
  var channelName = process.argv[2];
  var tokens = process.argv.slice(3);

  var wormhole_config = {};

  wormhole_config.description = "command-line portal for " + channelName;

  wormhole_config.portals = [];
  tokens.forEach(function(t) {
    wormhole_config.portals.push({ 'token': t, 'channelName': channelName })
  });

  wormhole_config.tmpDir = tmpDir;

  wormholes.push(new Wormhole(wormhole_config));

} else {
  var config = JSON.parse(fs.readFileSync(argv.configfile, 'utf8'))

  _.forEach(config.wormholes, function(name, whconfig) {

    
  });



} 


wormholes.forEach(function(wh) {
  wh.run();
});
