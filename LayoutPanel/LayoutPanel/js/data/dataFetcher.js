define(function () {
    function DataFetcher() {
    }

    DataFetcher.prototype.dalGet = function (url, params, callback) {
        $.ajax({
            url: url,
            type: "GET",
            crossDomain: true,
            data: params,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                if (callback != undefined && callback != null && typeof (callback) == "function")
                    callback(data);
            }
        });
    };

    return new DataFetcher();
});