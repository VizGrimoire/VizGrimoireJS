describe("VizGrimoireJS data", function() {
    beforeEach(function() {
        waitsFor(function() {
            return Loader.check_data_loaded();
        }, "It took too long to load data", 100);
    });
    describe("Report", function() {
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
});
