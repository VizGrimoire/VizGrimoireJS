var vizjsDoc = {};

(function() {
    // Build a new div with method info and convert it
    vizjsDoc.showDiv = function(divDisplay, method) {
        var new_div = "<div id='"+method+"'>"+method+"</div>";
        $("#"+divDisplay).empty();
        $("#"+divDisplay).append(new_div);
        Report.convertGlobal();
        Report.convertStudies();
    };
    
    vizjsDoc.showSections = function(divid, divdisplay) {
        $.getJSON("vizjsapi2.json", null, function(apidata) {
            var sections = "";
            $.each(apidata.sections, function(section, contents) {
                sections += "<h4>"+section+"<h4>";
                $.each(contents, function(method, method_desc) {
                    sections += "<button onClick='";
                    sections += "vizjsDoc.showDiv(\""+divdisplay+"\",\""+method+"\")";
                    sections += "' class='btn'>"+method+"</button>";
                });
            });
            $("#"+divid).append(sections);
        });
    };
})();
