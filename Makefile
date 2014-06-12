all: 
	$(info > HTML pages being generated)
	cd templates && ./gen.sh
	$(info > Do not forget to customize the navbar.tmpl!)
clean:
	rm ./browser/*.html
	$(info > HTML pages deleted)
test: vizgrimoire.min.js
	cd test/jasmine; jasmine-headless-webkit -j jasmine.yml -c
	cd ../..

testci: vizgrimoire.min.js
	cd test/jasmine; xvfb-run jasmine-headless-webkit -j jasmine.yml -c
	cd ../..
