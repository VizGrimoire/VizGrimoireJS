/* 
 * Copyright (C) 2012 Bitergia
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 */

var Identity = {};

(function() {
    var unique_list = "unique-sortable";
    
    function sortSelList(list_divid, list, name) {
        var connect = "";
        list_divid === unique_list ? connect ="" : connect = unique_list;
        $('#'+list_divid).append(list);
        $('#'+name).sortable({
            handle: ".handle",
            connectWith: "#"+connect,
            start: function(e, info) {
                info.item.siblings(".ui-selected").appendTo(info.item);
            },
            stop: function(e, info) {
                // Multi-item d&d
                info.item.after(info.item.find("li"));
                if (info.item[0].parentNode.id !== unique_list) return;
                // Group identifiers under person
                if (info.item.prev().find("ul").length === 0)
                    info.item.prev().append("<ul></ul>");            
                info.item.prev().find("ul").append(info.item);                
            }
        }).selectable()
        .find('li')
            .prepend( "<div class='handle'></div>" );        
    }
    
    Identity.showList = function(list_divid, ds) {
        var list ="";
        if (ds === undefined) {
            list ='<ol id='+unique_list+' class="sortable" style="padding: 5px; background: #eee;"></ol>';
            // sortSelList(list_divid, list, unique_list);
            $('#'+list_divid).append(list);
            $('#'+unique_list)
                .sortable()
                .selectable();
        }
        else {
            var people = ds.getPeopleData();
            list ='<ol id="'+ds.getName()+'-sortable" class="sortable">';            
            for (var i=0; i<people.id.length; i++) {
                list += '<li class="ui-widget-content ui-selectee">';
                list += people.id[i] +' ' + people.name[i];
                list += '</li>';            
            }
            list += '</ol>';
            sortSelList(list_divid, list, ds.getName()+"-sortable");
        }
    };
})();