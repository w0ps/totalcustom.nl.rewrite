var config = require('./config.json'),
	hop = require('hopcms');

hop.init(config, function(site, app, server, socketeer){
	console.log('hello world');
});
