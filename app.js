var config = require('./config.json'),
	hop = require('hop');

hop.init(config, function(site, app, server, socketeer){
	console.log('hello world');
});
