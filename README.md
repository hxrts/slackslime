Slack Slime
===========

Sync channels between multiple Slack teams.

[![Current Version](https://img.shields.io/npm/v/slackslime.svg?style=flat-square)](https://npmjs.com/slackslime)

<img src="slackslime.png" width="420">

# Example output

<img src="screenshot.png" width="500">

# Install
- 2+ Slack teams & their RTM API tokens - get your token at https://my.slack.com/services/new/bot
- `npm install`

# Setup

- Using config (can handle more than one wormhole at a time):
  - `node --use-strict slackslime.js --configfile myConfig.json`
  - See `example.config.json` for example config file format.
  
- Using command-line (one wormhole):
  - `nodejs slackslime.js [channel name] [RTM API token 1] [RTM API token 2] [RTM API token 3] [more tokens]`
  - Eg: `nodejs devchat xoxb-1111111111-xxx xoxb-2222222222-xxx xoxb-3333333333-xxx`
  - Or with `PM2: pm2 start slackslime.js -- devchat xoxb-1111111111-xxx xoxb-2222222222-xxx xoxb-3333333333-xxx`


# Using Wormhole.js 
```
var Wormhole = require('./Wormhole');
var options = {
  'channelName' : 'random',
  'tokens': ['xoxb-123', 'xoxb-456']
};
var w = new Wormhole(options, { tmpDir: "/temp/file/directory" });
w.run(); // will create a wormhole!
```

# To Do
- [X] add support for private groups
- [ ] fix bug where username & gravatar stop propogating after unspecified time
- [ ] @mention lookups
- [ ] link two channels with different names
- [X] multiple syncs
- [ ] deleting messages / files
- [ ] editing messages / files
- [ ] emojis?
- [ ] threads??
- [ ] change !list feature into slash command
- [X] Use config file instead of command-line for running
- [ ] people join/leave channels!

# License
Slack Slime is Licensed under the terms of the [MIT license](LICENSE).

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/franciskim/slackslime/blob/master/LICENSE)
