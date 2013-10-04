describe("VizGrimoireJS data validity", function() {
    beforeEach(function() {
        waitsFor(function() {
            return Loader.check_data_loaded();
        }, "It took too long to load data", 1000);
    });

    function getDataSource(name) {
        var ds = null;
        var data_sources = Report.getDataSources();

        $.each(data_sources, function(index, DS) {
            if (DS.getName() === name) {
                ds = DS;
                return false;
            }
        });
        return ds;
    }

    describe("SCM Correlations", function() {
        it("High commits and authors", function() {
            ds = getDataSource('scm');
            commits = ds.getData().scm_commits;
            authors = ds.getData().scm_authors;
            expect(ss.sample_correlation(commits,authors)).toBeGreaterThan("0.9");
        });        
        it("High commits and files", function() {
            ds = getDataSource('scm');
            commits = ds.getData().scm_commits;
            files = ds.getData().scm_files;
            expect(ss.sample_correlation(commits,files)).toBeGreaterThan("0.9");        
        });        
        it("Medium added lines and removed lines", function() {
            ds = getDataSource('scm');
            added_lines = ds.getData().scm_added_lines;
            removed_lines = ds.getData().scm_removed_lines;
            expect(ss.sample_correlation(added_lines,removed_lines)).toBeGreaterThan("0.8");        
        });
    });
    
    describe("ITS Correlations", function() {
        it("Medium openers and opened", function() {
            ds = getDataSource('its');
            openers = ds.getData().its_openers;
            opened = ds.getData().its_opened;
            expect(ss.sample_correlation(opened, openers)).toBeGreaterThan("0.8");
        });
        it("High closers and closed", function() {
            ds = getDataSource('its');
            its_closers = ds.getData().its_closers;
            its_closed = ds.getData().its_closed;
            expect(ss.sample_correlation(its_closed, its_closers)).toBeGreaterThan("0.9");
        });
        it("Medium changers and changed", function() {
            ds = getDataSource('its');
            changers = ds.getData().its_changers;
            changed = ds.getData().its_changed;
            expect(ss.sample_correlation(changed, changers)).toBeGreaterThan("0.8");
        });        
    });
});
