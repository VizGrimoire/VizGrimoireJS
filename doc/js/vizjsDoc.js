var vizjsDoc = {};

(function() {

    var div_sectios, div_display;
    
    function getMethodDesc(method_name) {
        var method_desc;
        $.each(vizjsDoc.API.sections, function(section, contents) {
            $.each(contents, function(method, desc) {
                if (method_name === method) method_desc = desc;
            });
        });
        return method_desc;
    }

    // Build a new div with method info and convert it
    vizjsDoc.showDiv = function(method) {
        var desc = getMethodDesc(method);
        var new_div = "<div id='"+method+"'>"+method+"</div>";
        var convertFn = Report["convert"+method];
        if (!convertFn) return;
        $("#"+div_display).empty();
        $("#"+div_display).append(new_div);
        if (desc.params) {
            $("#"+method).addClass(method);
            $.each(desc.params, function(param, desc) {
                $("#"+method).attr("data-"+param,"scm");
            });
        }
        convertFn();
        // Report.convertGlobal();
        // Report.convertStudies();
    };
    
    vizjsDoc.build = function() {
        var sections = "";
        $.each(vizjsDoc.API.sections, function(section, contents) {
            sections += "<h4>"+section+"<h4>";
            $.each(contents, function(method, method_desc) {
                sections += "<button onClick='";
                sections += "vizjsDoc.showDiv(\""+method+"\")";
                sections += "' class='btn'>"+method+"</button>";
            });
        });
        $("#"+div_sections).append(sections);
    };
    
    vizjsDoc.show = function(divid, divdisplay) {
        div_sections = divid;
        div_display = divdisplay;
        $.getJSON("vizjsapi2.json", null, function(apidata) {
            vizjsDoc.API = apidata;
            vizjsDoc.build();
        });
    };
})();
