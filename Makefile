# See the README for installation instructions.

JS_UGLIFY = uglifyjs

all: \
	vizgrimoire.js \
	vizgrimoire.min.js
	
.INTERMEDIATE vizgrimoire.js: \
	vizgrimoire.core.js

vizgrimoire.deps.js: \
    src/envision.js \
    src/flotr2.js \
    src/markers.js \
    src/jquery-1.7.1.min.js \
    src/jquery.gridster.js

vizgrimoire.core.js: \
    src/Envision_Report.js \
    src/Report.js \
    src/Viz.js \
    src/ITS.js \
    src/MLS.js \
    src/SCM.js
    
%.min.js: %.js Makefile
	@rm -f $@
	# $(JS_UGLIFY) -o $@ -c -m $<
	$(JS_UGLIFY) -o $@ $<  

vizgrimoire%js: Makefile
	@rm -f $@
	@cat $(filter %.js,$^) > $@
	# @cat $(filter %.js,$^) > $@.tmp
	# $(JS_UGLIFY) -o $@  $@.tmp
	# @rm $@.tmp
	@chmod a-w $@
	
clean:
	rm -f vizgrimoire*.js


