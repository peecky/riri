var http = require('http');
var url = require('url');

http.createServer(function(req, res) {
	var urlInfo = url.parse(req.url, true);
	var pathname = urlInfo['pathname'];
	var pathDirs = pathname.split('/');

	switch (pathDirs[1]) {
		case 'r': {
			var riri = require('./riri.js');
			riri.request({
				prefix: '/r/',
				httpRequest: req,
				httpResponse: res,
			});
		}
		break;

		default: {
			res.writeHead(404);
			res.end('404 Page not found.\n');
		}
		break;
	}
}).listen(3000, 'localhost');
