Slack Slime [![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/franciskim/slackslime/blob/master/LICENSE) [![Current Version](https://img.shields.io/npm/v/slackslime.svg?style=flat-square)](https://npmjs.com/slackslime)
===========

Sync channels between multiple lack teams.

<img src="slackslime.png" width="420">

# Example output

<img src="screenshot.png" width="500">

# Setup
- *Slack Slime runs from the command line, not via module.exports*
- 2+ Slack teams & their RTM API tokens - get your token at https://my.slack.com/services/new/bot
- `npm install slackslime`
- `nodejs slackslime.js [channel name] [RTM API token 1] [RTM API token 2] [RTM API token 3] [more tokens]`
- eg: `nodejs devchat xoxb-1111111111-xxx xoxb-2222222222-xxx xoxb-3333333333-xxx`
- or with `PM2: pm2 start slackslime.js -- devchat xoxb-1111111111-xxx xoxb-2222222222-xxx xoxb-3333333333-xxx`

# To Do
- [ ] @mention lookups
- [ ] link two channels with different names
- [ ] multiple syncs
- [ ] emojis?
- [ ] deleting messages
- [ ] editing messages
- [ ] stability testing
- [x] typing status

# License
Slack Slime is Licensed under the terms of the [MIT license](LICENSE).
