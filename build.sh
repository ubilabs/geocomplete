# sh build.sh

# minify script
uglifyjs jquery.geocomplete.js > jquery.geocomplete.min.js

## create documentation
docco jquery.geocomplete.js
mv docs/jquery.geocomplete.html docs/index.html