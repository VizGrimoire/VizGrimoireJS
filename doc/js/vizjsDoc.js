var vizjsDoc = {};

(function() {
    $.getJSON("vizjsapi2.json", null, function(history) {
        vizjsDoc.API = history;
    });
})();
