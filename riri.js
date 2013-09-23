var url = require('url');
var http = require('http');

var config = require('./config.js');

function request(option) {
	var res = option.httpResponse;
	var req = option.httpRequest;
	var URIPrefix = option.prefix;

	if (URIPrefix.charAt(0) != '/') URIPrefix = '/' + URIPrefix;
	if (URIPrefix.charAt(URIPrefix.length-1) != '/') URIPrefix = URIPrefix + '/';

	var urlInfo = url.parse(req.url, true);
	var pathname = urlInfo['pathname'].substring(URIPrefix.length);
	var baseURLKey = pathname.split('/')[0];
	var baseURL = config.baseURLs[baseURLKey];

	if (typeof baseURLKey == 'undefined' || typeof baseURL == 'undefined') {
		res.writeHead(404);
		res.end('404 Page not found.');
		return;
	}
	var requestURI = urlInfo['path'].substring(URIPrefix.length + baseURLKey.length);

	var req2 = http.request(url.resolve(baseURL, requestURI), function(res2) {
		//console.log(res2.statusCode);
		// todo: check res2.statusCode
		//console.log(res2.headers);
		var isHTMLDocument = res2.headers["content-type"].split(';')[0] == 'text/html';
		if (isHTMLDocument) {
			res2.setEncoding('utf-8');
		}
		else {
			res.writeHead(200, res2.headers);
		}
		var responseBody = '';
		res2.on('data', function(chunk) {
			if (isHTMLDocument) responseBody += chunk;
			else res.write(chunk);
		});
		res2.on('end', function() {
			if (isHTMLDocument) {
				// remove scripts
				responseBody = responseBody.replace(/<script(\s|>).*?<\/script>/gim, '');
				responseBody = responseBody.replace(/<script/gi, '<noscript');
				responseBody = responseBody.replace(/<\/script/gi, '</noscript');

				// change absolute URLs in the same domain
				var replaceStr = URIPrefix + baseURLKey + '$1"';
				responseBody = responseBody.replace(/src="(\/.*?)"/gi, 'src="' + replaceStr);
				responseBody = responseBody.replace(/href="(\/.*?)"/gi, 'href="' + replaceStr);
				responseBody = responseBody.replace(/action="(\/.*?)"/gi, 'action="' + replaceStr);	// form submit

				res.end(responseBody);
			}
			else res.end();
		});
	});
	req2.end();
}

module.exports.request = request;