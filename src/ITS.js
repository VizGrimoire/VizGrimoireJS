/* 
 * 
 * Copyright (C) 2012, Bitergia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * ITS.js: Library for visualizing Bitergia ITS data
 */

(function() {
    var basic_metrics = {
        'opened' : {
            'divid' : 'its-opened',
            'column' : "opened",
            'name' : "Opened",
            'desc' : "Number of opened tickets",
            'envision' : {
                y_labels : true,
                show_markers : true
            }
        },
        'openers' : {
            'divid' : 'its-openers',
            'column' : "openers",
            'name' : "Openers",
            'desc' : "Unique identities opening tickets",
            'action' : "opened",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'closed' : {
            'divid' : 'its-closed',
            'column' : "closed",
            'name' : "Closed",
            'desc' : "Number of closed tickets"
        },
        'closers' : {
            'divid' : 'its-closers',
            'column' : "closers",
            'name' : "Closers",
            'desc' : "Number of identities closing tickets",
            'action' : "closed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'changed' : {
            'divid' : 'its-changed',
            'column' : "changed",
            'name' : "Changed",
            'desc' : "Number of changes to the state of tickets"
        },
        'changers' : {
            'divid' : 'its-changers',
            'column' : "changers",
            'name' : "Changers",
            'desc' : "Number of identities changing the state of tickets",
            'action' : "changed",
            'envision' : {
                gtype : 'whiskers'
            }
        }
    };    
    Report.registerDataSource(new DataSource("its", basic_metrics));
})();