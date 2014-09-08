var base = "http://127.0.0.1:8080";

var l = function() { console.log.apply(console, arguments); };
var guid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = (c == "x") ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
};

var request = function(endpoint, data, callback) {
    jsonp(base + endpoint, data, callback);
};

var separator = function() {
    return span(" | ");
};

var a = function(text, callback) {
    var element = document.createElement("a");
    element.setAttribute("href", "javascript:void(0)");
    element.addEventListener("click", callback);
    element.appendChild(document.createTextNode(text));
    return element;
};

var span = function(text, className) {
    var element = document.createElement("span");
    element.appendChild(document.createTextNode(text));
    if (className != null) element.classList.add(className);
    return element;
};

var div = function(id) {
    var children = [].slice.call(arguments);
    var element = document.createElement("div");
    element.setAttribute("id", children.shift());
    children.forEach(function(child) {
        element.appendChild(child);
    });
    return element;
};

var drawYak = function(id, message, likes) {
    var yak = div("yak-" + id, a("wow", function() {
        var self = this;
        login(function(id, latitude, longitude) {
            vote(id, self.parentElement.id.slice(4), latitude, longitude, true, l);
        });
    }), span(" " + ("    " + likes).slice(-4) + " ", "likes"), a("nah", function() {
        var self = this;
        login(function(id, latitude, longitude) {
            vote(id, self.parentElement.id.slice(4), latitude, longitude, false, l);
        });
    }), separator(), span(message), separator());
    yak.classList.add("yak");
    document.getElementById("yaks").appendChild(yak);
}

var getLocation = function(callback) {
    navigator.geolocation.getCurrentPosition(function(position) {
        latitude = position.coords.latitude.toFixed(6);
        longitude = position.coords.longitude.toFixed(6);
        callback(latitude, longitude);
    });
};

var vote = function(userId, messageId, latitude, longitude, upvote, callback) {
    var endpoint = upvote ? "/api/likeMessage" : "/api/downvoteMessage";
    request(endpoint, {
        "userID": userId,
        "messageID": messageId,
        "lat": latitude,
        "long": longitude
    }, function(data) {
        callback((data === 1) ? 1 : null);
    })
};

var registerUser = function(callback) {
    var id = guid();
    getLocation(function(latitude, longitude) {
        request("/api/registerUser", {
            "userID": id,
            "lat": latitude,
            "long": longitude
        }, function(data) {
            callback((data === 1) ? id : null, latitude, longitude);
        });
    });
};

var login = function(callback) {
    if (localStorage.getItem("userData") == null) {
        registerUser(function(id, latitude, longitude) {
            localStorage.setItem("userData", JSON.stringify([id, latitude, longitude]));
            callback(id, latitude, longitude);
        });
    } else {
        callback.apply(null, JSON.parse(localStorage.getItem("userData")));
    }
};

login(function(id, latitude, longitude) {
    request("/api/getMessages", { "lat": latitude, "userID": id, "long": longitude }, function(data) {
        data.messages.forEach(function(yak) {
            drawYak(yak.messageID, yak.message, yak.numberOfLikes);
        });
    });
});
