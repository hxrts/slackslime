var slackAPI = require('slackbotapi');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');

class Wormhole {

  constructor(wormhole, config) {
    this.wormhole = wormhole;
    this.config = config;
    // inside wormhole is an array of portals; each 'portal' is a slack channel and token pair.
    this.slacks = new Array();
    this.connectedTeams = 0;
  }

  run() {
    var context = this; // using 'context' because some other methods use self and it gets confusing

    //----------------
    // main event loop
    //----------------
    
    context.wormhole.tokens.forEach(function(token, i) {

        //-------------------
        // manage connections
        //-------------------

        // initialize
        context.slacks[i] = new slackAPI({
            'token': token,
            'logging': false,  // for output debug
            'autoReconnect': true
        });

        // session info
        context.slacks[i].on('hello', function(data) {

            var helloInstance = this.slackData.team.name + ' / ' + context.wormhole.channelName;

            console.log('\n' + _.repeat('-', helloInstance.length) + '\n' + helloInstance + '\n' + _.repeat('-', helloInstance.length) + '\n');

            if(this.getChannel(context.wormhole.channelName)) {
                this.channelId = this.getChannel(context.wormhole.channelName).id;
                this.channelType = 'public';
                console.log('connecting to public channel ' + this.channelId + '\n');
            } else {
                this.channelId = this.getGroup(context.wormhole.channelName).id;
                this.channelType = 'private';
                console.log('connecting to private channel ' + this.channelId + '\n');
            }
            context.connectedTeams++;
        });

        // close connection
        context.slacks[i].on('close', function(data) {
            context.connectedTeams--;
        });


        //---------------------
        // typing notifications
        //---------------------

        context.slacks[i].on('user_typing', function(data) {

            var self = this;

            context.slacks.forEach(function(slack) {

                if(slack.token !== self.token) {

                    if(self.channelType === 'public') {

                        var channelMatch = slack.slackData.channels.filter(function (channelRemote) {
                            return channelRemote.name === context.wormhole.channelName;
                        })[0];

                    } else {

                        var channelMatch = slack.slackData.groups.filter(function (channelRemote) {
                            return channelRemote.name === context.wormhole.channelName;
                        })[0];

                    }

                    slack.sendTyping(channelMatch.id);
                }
            })
        });


        //--------------
        // message logic
        //--------------

        context.slacks[i].on('message', function(data) {

            // handle file_share message subtypes instead of file_shared events
            // Slack's API doesn't send much info with file_shared anymore
            if(data.subtype === 'file_share') {
                onFileShare(this, data);
                return;
            }

            var self = this;
            var user = self.getUser(data.user);
            var teamName = self.slackData.team.name;

            if(self.channelType === 'public') {
                var channel = self.getChannel(data.channel);
            } else {
                var channel = self.getGroup(data.channel);
            }

            if(typeof data.text === 'undefined' || data.subtype === 'bot_message' || !channel || channel.name !== context.wormhole.channelName) {
                return;
            }

            // parse user names
            if(user) {
                data.username = user.name;
                data.iconUrl = user.profile.image_48;
            }

            // look for mentions and convert user handles to plaintext
            var re = RegExp("((<@)[^\>]+)>", 'g');

            if(re.test(data.text) && user) {
                data.text = data.text.replace(re, function getUserName(userString) {
                    return '@' + self.getUser(userString.substring(2, userString.length - 1)).name;
                });
            }

            // messaging logic
            if(data.text.charAt(0) === '!') {  // bot / channel commands should go here

                // split command and its arguments into an array
                var command = data.text.substring(1).split(' ');

                switch(command[0].toLowerCase()) {
                    case 'list':
                        // send a list of all users on every chat and send via DM/PM
                        var message = '', awayCount = 0, activeCount = 0, userCount = 0;

                        context.slacks.forEach(function(s) {
                            s.reqAPI('channels.info', {channel: s.channelId}, function(d) {
                                if(d.ok) {
                                    d.channel.members.forEach(function(user) {
                                        if(s.getUser(user)) {
                                            var status = ':question: ';
                                            userCount++;

                                            if(s.getUser(user).presence === 'active') {
                                                status = ':coffee: ';
                                                activeCount++;
                                            }

                                            if(s.getUser(user).presence === 'away') {
                                                status = ':zzz: ';
                                                awayCount++;
                                            }

                                            message += status + ' `' + (s.slackData.team.name + _.repeat(' ', 16)).substring(0, 16) + '` @' + s.getUser(user).name + '\n';
                                        }
                                    })
                                }
                            });
                        });

                        setTimeout(function() {
                            self.sendPM(
                                data.user,
                                message + '––––––––––––––––––––––––\n' +
                                '*Active:* ' + activeCount + '     ' +
                                '*Total:* '  + userCount   + '     ' +
                                '*Teams:* '  + context.connectedTeams
                                );
                        }, 2000); // 2 second default wait
                        break;
                }
            }

            else if(!data.subtype) { // send normal user message to other team(s)

                var message = {
                    channel: '#' + context.wormhole.channelName,
                    text: data.text,
                    username: data.username + ' @ ' + teamName,
                    icon_url: data.iconUrl,
                    unfurl_links: true,
                    unfurl_media: true
                };

                context.slacks.forEach(function(slack) {
                    if(slack.token !== self.token) {
                        slack.reqAPI('chat.postMessage', message);
                    }
                })
            }
        });


        //--------------
        // file handling
        //--------------

        // download handler
        var downloadSlackFile = function(options, callback) {
            var stream = request({
                url: options.url,
                headers: {
                  'Authorization': 'Bearer ' + options.token
                }
            }).pipe(fs.createWriteStream(options.directory + options.filename));
            stream.on('finish', callback);
        }

        // upload handler
        var uploadSlackFile = function(upload_options, callback) {
            // this method is here because slackbotapi library can't seem to handle file uploads
            request.post({
                url: 'https://slack.com/api/files.upload',
                formData: upload_options,
            }, function (err, response) {
                callback(err, response);
            });
        }


        // send shared file to other team's public shared store
        var onFileShare = function(self, data) {
            // shared files in public channels already have a public URL (!)
            // todo: ask if the file should be shared
            var user = self.getUser(data.file.user);
            var teamName = self.slackData.team.name;

            if(self.channelType === 'public') {
                var channel = self.getChannel(data.file.channels.splice(-1)[0]);  // https://api.slack.com/types/file
            } else {
                var channel = self.getGroup(data.file.channels.splice(-1)[0]);
            }

            if(channel.name !== context.wormhole.channelName) {
                return;
            }

            if(user.is_bot) {
                return;  //otherwise we risk an infinite loop
            }

            if(user) {  // unfortunately image uploads don't support as-user avatar changes
                data.username = user.name;
                data.iconUrl = user.profile.image_48;
            }

            var download_options = {
                url: data.file.url_private,
                directory: context.config.tmpDir,
                filename: data.file.name,
                token: self.token
            };

            var downloaded_file_path = downloadSlackFile(download_options, function() {

                var initial_comment = 'From ' + data.username + ' @ ' +  teamName;
                if(data.file.comments_count > 0) {
                  initial_comment += ":\n \"" + data.file.initial_comment.comment + "\"";
                }

                var upload_options = {
                    channels: '#' + context.wormhole.channelName,
                    filename: data.file.name,
                    title: data.username + ' @ ' + teamName + ' posted: ' + data.file.name,
                    filetype: 'auto',
                    initial_comment: initial_comment,
                    file: fs.createReadStream(download_options.directory + download_options.filename)
                };

                context.slacks.forEach(function(slack) {
                    if(slack.token !== self.token) {  // so we don't send it to ourselves

                        var this_upload_options = upload_options;
                        this_upload_options['token'] = slack.token;

                        uploadSlackFile(this_upload_options, function(err, response) {
                        });
                    }
                })

            });  // downloaded_file_path

        }  // slacks[i].on('message', ...)

    });  // context.wormhole.tokens.forEach(function(token, i), ...)

  }
}

module.exports = Wormhole;
