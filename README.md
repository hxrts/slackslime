Slack Slime
===========

Sync channels between multiple Slack teams.

[![Current Version](https://img.shields.io/npm/v/slackslime.svg?style=flat-square)](https://npmjs.com/slackslime)

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
- [X] add support for private groups
- [ ] fix bug where username & gravatar stop propogating after unspecified time
- [ ] @mention lookups
- [ ] link two channels with different names
- [ ] multiple syncs
- [ ] deleting messages / files
- [ ] editing messages / files
- [ ] emojis?
- [ ] threads??
- [ ] change !list feature into slash command
- [ ] Use config file instead of command-line for running

# License
Slack Slime is Licensed under the terms of the [MIT license](LICENSE).

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/franciskim/slackslime/blob/master/LICENSE)
