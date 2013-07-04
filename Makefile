test: FORCE
	cd test/jasmine; jasmine-headless-webkit -j jasmine.yml -c
	cd ../..

testci: FORCE
	cd test/jasmine; xvfb-run jasmine-headless-webkit -j jasmine.yml -c
	cd ../..
	
FORCE: