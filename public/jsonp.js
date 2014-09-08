;(function(global, doc, undefined) {

var stringify = function(obj) {
    return Object.keys(obj).map(function(key) {
        var value = obj[key];
        if (Array.isArray(value)) {
            return value.map(function(x) {
                return encodeURIComponent(key) + "=" + encodeURIComponent(x);
            }).join("&");
        } else {
            return encodeURIComponent(key) + "=" + encodeURIComponent(value);
        }
    }).join("&");
};

var insertElement = function(element) {
    var ref = doc.getElementsByTagName("script")[0];
    ref.parentNode.insertBefore(element, ref);
};

var removeElement = function(element) {
    element.parentNode.removeChild(element);
};

var hash = function(s) {
    return s.split("").reduce(function(a,b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0).toString().replace(/-/, "_");
};

var jsonp = function(url, data, callback) {
    if (typeof data === "function" && callback == null) {
        callback = data;
        data = {};
    }

    var script = doc.createElement("script");

    var cb = "callback" + hash(url + Date.now() + Math.random() + stringify(data));
    data.callback = cb;
    global[cb] = function(json) {
        callback(json);
        delete global[cb];
        removeElement(script);
    };

    script.setAttribute("src", url + ((url.indexOf("?") === -1) ? "?" : "&") + stringify(data));
    script.setAttribute("type", "text/javascript");
    script.addEventListener("error", function() {
        global[cb](null);
    });
    insertElement(script);
};

global["jsonp"] = jsonp;

})(this, this.document);
