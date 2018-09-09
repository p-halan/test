function loadCss(url) {
    var link = $('link[href="' + url + '"]');
    if (link.length == 0) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    link = null;
}

function loadHtml(url, callback) {
    if (CURRENT_DOMAIN == undefined || CURRENT_DOMAIN == null || CURRENT_DOMAIN == '') {
        require(["text!/" + url + ".html?v=231"], function (htmlContent) {
            if (callback != undefined && callback != null)
                callback(htmlContent);
        });
    }
    else {
        require([url + ".js?callback=define"], function (htmlContent) {
            if (callback != undefined && callback != null)
                callback(htmlContent.replace(/%27/g, "'"));
        });
    }
}