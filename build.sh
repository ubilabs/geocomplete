# sh build.sh

# minify script
uglifyjs --comments license jquery.geocomplete.js > jquery.geocomplete.min.js

## create documentation
docco jquery.geocomplete.js
mv docs/jquery.geocomplete.html docs/index.html

rm -Rf _temp

mkdir _temp
mkdir _temp/examples

mv docs _temp
cp jquery.geocomplete.js _temp/
cp jquery.geocomplete.min.js _temp/
cp examples/* _temp/examples