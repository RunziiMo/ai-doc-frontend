npm run build
cp dist/index.html ../mindoc/views/document/index.html
rm -rf ../mindoc/assets
rm -rf ../mindoc/static/fonts/SIMHEI.ttf
cp -r dist/assets ../mindoc/assets
cp -r dist/static/fonts/SIMHEI.ttf ../mindoc/static/fonts/
npm run dev