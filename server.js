var request = require("request");
var http = require("http");
var crypto = require("crypto");
var url = require("url");
var querystring = require("querystring");

var base = "http://yikyakapp.com";
var ua = "android-async-http/1.4.4 (http://loopj.com/android-async-http)"; // #legit
var key = "35FD04E8-B7B1-45C4-9886-94A75F4A2BB4";

http.createServer(function(req, res) {
    if (/^\/api\//.test(req.url)) {
        var parsedUrl = url.parse(req.url, true);
        delete parsedUrl.search; // evil property

        var callback = parsedUrl.query.callback;
        delete parsedUrl.query.callback; // we don't want the fuzz to catch on

        var salt = Math.floor(new Date() / 1000).toString();
        var keys = Object.keys(parsedUrl.query).sort();
        var sorted = {}; // yolo
        keys.forEach(function(key) {
            sorted[key] = parsedUrl.query[key];
        });
        parsedUrl.query = sorted;
        parsedUrl.query["hash"] = crypto.createHmac("sha1", key).update(url.format(parsedUrl) + salt).digest("base64")
        parsedUrl.query["salt"] = salt;

        console.log("Calling `" + base + url.format(parsedUrl) + "` instead");
        request(base + url.format(parsedUrl), {
            "headers": {
                "User-Agent": ua
            }
        }, function(err, response, body) {
            if (err) throw err;
            if (body.trim() !== "") {
                res.writeHead(200, {"Content-Type": "text/javascript"});
                res.end("/**/ typeof " + callback + " === \"function\" && " + callback + "(" + JSON.stringify(JSON.parse(body)) + ");"); // just to be safe
            } else {
                res.writeHead(400, {"Content-Type": "text/plain"});
                res.end("400: " + http.STATUS_CODES[400]);
            }
        });
    }
}).listen(8080);
