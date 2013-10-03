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

    // Fills params with default values
    function addParamsDiv(divid, params) {
        $.each(params, function(param, desc) {
            if (param === "data-source")
                $("#"+divid).attr("data-"+param,"scm");
            if (param === "data-source" && divid === "TimeTo")
                $("#"+divid).attr("data-"+param,"its");                
            if (param === "radius")
                $("#"+divid).attr("data-"+param,"0.5");
            if (param === "file" && divid === "Treemap")
                $("#"+divid).attr("data-"+param,"treemap.json");
            if (param === "metric")
                $("#"+divid).attr("data-"+param,"scm_commits");
            if (param === "metric" && divid === "Top")
                $("#"+divid).attr("data-"+param,"authors");
            if (param === "metrics")
                $("#"+divid).attr("data-"+param,"scm_commits");
            if (param === "period")
                $("#"+divid).attr("data-"+param,"Year");
            if (param === "field")
                $("#"+divid).attr("data-"+param,"scm_commits");
            if (param === "type")
                $("#"+divid).attr("data-"+param,"fix");
            if (param === "quantil")
                $("#"+divid).attr("data-"+param,"X0.99,X0.95");
            if (param === "person_id")
                $("#"+divid).attr("data-"+param,"1");
            if (param === "person_name")
                $("#"+divid).attr("data-"+param,"Person1");
        });    
    }

    // Build a new div with method info and convert it
    vizjsDoc.showDiv = function(method) {
        var desc = getMethodDesc(method);
        var new_div = "<div";
        new_div += " id='"+method+"'";
        new_div += " class='"+method;
        if (desc.classCSS) new_div += " " + desc.classCSS;
        new_div += "'></div>";
        var convertFn = Report["convert"+method];
        if (!convertFn) return;
        $("#"+div_display).empty();
        $("#"+div_display).append(new_div);
        if (desc.params) {
            $("#"+method).addClass(method);
            addParamsDiv(method, desc.params);
        }
        convertFn();
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
