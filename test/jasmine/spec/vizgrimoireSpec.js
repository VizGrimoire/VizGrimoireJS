describe("VizGrimoireJS data", function() {
    beforeEach(function() {
        waitsFor(function() {
            return Loader.check_data_loaded();
        }, "It took too long to load data", 100);
    });
    describe("Basic Data", function() {
        it("data files should be loaded", function() {
            waitsFor(function() {
                return Loader.check_data_loaded();
            }, "It took too long to load data", 100);
            runs(function() {
                expect(Loader.check_data_loaded()).toBeTruthy();
            });
        });
        // We can start testing the data
        it("exist data sources", function() {
            var ds_data = Report.getDataSources()[0].data;
            expect(ds_data instanceof Array).toBeFalsy();
        });
    });
    
    describe("Data checking", function() {
        it("Evol metrics should be present in the Global metrics", function () {
            var data_sources = Report.getDataSources();
            $.each(data_sources, function(index, DS) {
                var global = DS.getGlobalData();
                var evol = DS.getData();
                for (field in evol) {
                    if (DS.getMetrics()[field]) {
                        expect(global[field]).toBeDefined();
                    }
                }
            });
        });
        it("Summable Evol metrics should sum Global metrics", function () {
            var data_sources = Report.getDataSources();
            // var summable_metrics= ['its_opened','its_closed','mls_sent','scm_commits','scr_sent'];
            var summable_metrics= ['its_opened','mls_sent','scm_commits'];
            $.each(data_sources, function(index, DS) {
                var global = DS.getGlobalData();
                var evol = DS.getData();
                for (field in evol) {
                    if (DS.getMetrics()[field]) {
                        if ($.inArray(field,summable_metrics)===-1) continue;
                        var metric_evol = evol[field];
                        var metric_total = 0;
                        for (var i=0; i<metric_evol.length;i++) {
                            metric_total += metric_evol[i];
                        }
                        // if (window.console) console.log('Checking ' + field);
                        expect(metric_total).toEqual(global[field]);
                    }
                }
            });            
        });
    });

    function checkDataReport(report) {
        if ($.inArray(report,['repos','companies','countries'])===-1) 
            return;
        var data_sources = Report.getDataSources();
        var repos = 0, repos_global = {}, repos_metrics = {};
        $.each(data_sources, function(index, DS) {
            if (report === "repos") {
                repos = DS.getReposData();
                repos_global = DS.getReposGlobalData();
                repos_metrics = DS.getReposMetricsData();
            }
            else if (report === "companies") {
                repos = DS.getReposData();
                repos_global = DS.getReposGlobalData();
                repos_metrics = DS.getReposMetricsData();
            }
            else if (report === "countries") {
                repos = DS.getReposData();
                repos_global = DS.getReposGlobalData();
                repos_metrics = DS.getReposMetricsData();
            }
            if (repos.length === 0) return;
            for (var i=0; i<repos.length; i++) {
                for (field in repos_metrics[repos[i]]) {
                    if (DS.getMetrics()[field]) {
                        expect(repos_global[repos[i]][field]).toBeDefined();
                    }
                }
            }
        });        
    }
    describe("Repositories checking", function() {
        it("All repositories should have Evol and Global metrics", function () {
            checkDataReport('repos');
        });
    });
    describe("Companies checking", function() {
        it("All companies should have Evol and Global metrics", function () {
            checkDataReport('companies');
        });
    });
    describe("Countries checking", function() {
        it("All countries should have Evol and Global metrics", function () {
            checkDataReport('countries');
        });
    });

});
