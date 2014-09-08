var request = require("request");
var express = require("express");
var crypto = require("crypto");
var url = require("url");
var querystring = require("querystring");

var base = "http://yikyakapp.com";
var ua = "android-async-http/1.4.4 (http://loopj.com/android-async-http)"; // #legit
var key = "35FD04E8-B7B1-45C4-9886-94A75F4A2BB4";

var app = express();

app.use("/api", function(req, res) {
    var parsedUrl = url.parse("/api" + req.url, true);
    delete parsedUrl.search; // evil property
    delete parsedUrl.query.callback; // we don't want the fuzz to catch on

    var salt = Math.floor(Date.now() / 1000).toString();
    var keys = Object.keys(parsedUrl.query).sort();
    var sorted = {}; // yolo sort
    keys.forEach(function(key) {
        sorted[key] = parsedUrl.query[key];
    });
    parsedUrl.query = sorted;
    parsedUrl.query["hash"] = crypto.createHmac("sha1", key).update(url.format(parsedUrl) + salt).digest("base64")
    parsedUrl.query["salt"] = salt;

    console.log("Calling " + base + url.format(parsedUrl) + " instead");
    request(base + url.format(parsedUrl), {
        "headers": {
            "User-Agent": ua
        }
    }, function(err, response, body) {
        if (err) throw err;
        if (body.trim() !== "") {
            res.jsonp(JSON.parse(body));
        } else {
            res.status(400).jsonp({
                "error": "400: Bad Request"
            });
        }
    });
}).listen(8080);
