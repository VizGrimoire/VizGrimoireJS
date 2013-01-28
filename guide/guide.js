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

var Guide = {};

(function() {
    
    function getFormDS(ds, tool) {
        var html = '';
        html += '<div id="'+ds+'_info" style="margin:5px">';
        html += tool + ' version:<input type="text" name="'+tool+'_ver"><br>';
        html += tool + ' command:<input type="text" name="'+tool+'_cmd"><br>';
        html += tool + ' steps:<textarea name="'+tool+'_details"></textarea><br>';
        html += tool + ' database:<input type="text" name="'+tool+'_db"><br>';
        html += '<input type="checkbox" name="dquality-'+ds+'"'; 
        html += '    value="'+ds+'_uidentities">Unique identities';
        html += '<input type="checkbox" name="dquality-'+ds+'" ';
        html += '    value="'+ds+'_bots">Bots';
        html += '<br>';                    
        html += '</div>';
        return html;
    } 
    
    Guide.displayDS = function(el_ds) {
        var tool = "";
        if (el_ds.value === "scm") {
            tool = "cvsanaly";
        } else if (el_ds.value === "its") {
            tool = "bicho";
        } else if (el_ds.value === "mls") {
            tool = "mlstats";
        }
        if (el_ds.checked) 
            $('#'+el_ds.parentElement.id).append(getFormDS(el_ds.value, tool));
        else $('#'+el_ds.value+'_info').remove();
    };
})();