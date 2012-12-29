describe( "VizGrimoireJS library", function () {
    describe( "Report", function () {
        it("data files should be loaded", function () {
            runs(function() {
                Report.data_load();
            });
            waitsFor(function() {
                return Report.check_data_loaded();
            }, "It took too long to load data", 100);
            runs(function() {
                expect(Report.check_data_loaded()).toBeTruthy();
            });
        });
        
    });
    describe("Viz", function () {
        
    });
    describe("Data Sources", function () {
        
    });
    describe("VizGrimoireJS loaded", function() {
        it("should be present in the global namespace", function () {
            expect(Report).toBeDefined();
            expect(Viz).toBeDefined();
            var data_sources = Report.getDataSources();
            $.each(data_sources, function(index, DS) {
                expect(DS).toBeDefined();
            });
        });
    });
});

    
//    it("throws an error when passed an unknown from-unit", function () {
//        var testFn = function () {
//            Convert(1, "dollar").to("yens");
//        }
//        expect(testFn).toThrow(new Error("unrecognized from-unit"));
//    });
//    it("throws an error when passed an unknown to-unit", function () {
//        var testFn = function () {
//            Convert(1, "cm").to("furlongs");
//        }
//        expect(testFn).toThrow(new Error("unrecognized to-unit"));
//    }); 
//});
