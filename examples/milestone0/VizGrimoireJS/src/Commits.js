/*
    (c) Bitergia S.L.
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {

    var V = envision;

    // Custom data processor
    function processData(options) {

        var resolution = options.resolution;

        options.preprocessor.bound(options.min, options.max).subsampleMinMax(
                resolution + Math.round(resolution / 3));
    }

    function getDefaults() {
        return {
            commits : {
                name : 'swscopio-commits-commits',
                config : {
                    'lite-lines' : {
                        lineWidth : 1,
                        show : true,
                        fill : true,
                        fillOpacity : 0.2,
                        color : '#ffa500',
                        fillColor : '#ffa500'
                    },
                    mouse : {
                        track : true,
                        trackY : false,
                        trackAll : true,
                        sensibility : 1,
                        trackDecimals : 4,
                        position : 'ne'
                    },
                    yaxis : {
                        autoscale : true,
                        autoscaleMargin : 0.05,
                        noTicks : 4,
                        showLabels : true,
                        min : 0
                    }
                },
                processData : processData
            },
            committers : {
                name : 'swscopio-commits-committers',
                config : {
                    whiskers : {
                        show : true,
                        lineWidth : 2,
                        color : '#ffa500'
                    },
                    mouse : {
                        track : true,
                        trackY : false,
                        trackAll : true
                    },
                    yaxis : {
                        autoscale : true,
                        autoscaleMargin : 0.5
                    }
                },
                processData : processData
            },
            summary : {
                name : 'swscopio-commits-summary',
                config : {
                    'lite-lines' : {
                        show : true,
                        lineWidth : 1,
                        fill : true,
                        fillOpacity : 0.2,
                        fillBorder : true,
                        color : '#ffa500',
                        fillColor : '#ff7500'
                    },
                    xaxis : {
                        noTicks : 5,
                        showLabels : true
                    },
                    yaxis : {
                        autoscale : true,
                        autoscaleMargin : 0.1
                    },
                    handles : {
                        show : true
                    },
                    selection : {
                        mode : 'x'
                    },
                    grid : {
                        verticalLines : false
                    }
                }
            },
            connection : {
                name : 'swscopio-commits-connection',
                adapterConstructor : V.components.QuadraticDrawing
            }
        };
    }

    function Commits(options) {

        var data = options.data, defaults = getDefaults();
        var vis = new V.Visualization({
            name : 'swscopio-commits'
        });
        var selection = new V.Interaction();
        var hit = new V.Interaction(), commits, committers, connection, summary;

        if (options.defaults) {
            defaults = Flotr.merge(options.defaults, defaults);
        }

        defaults.commits.data = data.commits;
        defaults.committers.data = data.committers;
        defaults.summary.data = data.summary;

        defaults.commits.config.mouse.trackFormatter = options.trackFormatter;

        if (options.xTickFormatter) {
            defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
        }
        defaults.commits.config.yaxis.tickFormatter = options.yTickFormatter
                || function(n) {
                    return '$' + n;
                };

        commits = new V.Component(defaults.commits);
        committers = new V.Component(defaults.committers);
        connection = new V.Component(defaults.connection);
        summary = new V.Component(defaults.summary);

        // Render visualization
        vis.add(commits).add(committers).add(connection).add(summary).render(
                options.container);

        // Define the selection zooming interaction
        selection.follower(commits).follower(committers).follower(connection)
                .leader(summary).add(V.actions.selection,
                        options.selectionCallback ? {
                            callback : options.selectionCallback
                        } : null);

        // Define the mouseover hit interaction
        hit.group([ commits, committers ]).add(V.actions.hit);

        // Optional initial selection
        if (options.selection) {
            summary.trigger('select', options.selection);
        }

        // Members
        this.vis = vis;
        this.selection = selection;
        this.hit = hit;
        this.commits = commits;
        this.committers = committers;
        this.summary = summary;
    }

    V.templates.Commits = Commits;
})();