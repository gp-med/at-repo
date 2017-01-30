#!/bin/bash          
cd assets/js/
cat jquery.js modal.js dropdown.js d3.v3.js d3.tip.js app.js > all.js
java -jar ../../yui.jar --type js all.js > ../../../public/js/main.js

cd ../css/less/
lessc bootstrap.less > ../bootstrap.css
cd fa
lessc font-awesome.less > ../../fa.css
cd ../..
cat fa.css roboto.css bootstrap.css > ./all.css
purifycss ./all.css ../sample.html --out ./mini.css --info
java -jar ../../yui.jar --type css ./mini.css > ../../../public/css/main.css

echo "css updated on `date`"

