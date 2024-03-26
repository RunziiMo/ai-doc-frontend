npm run build
cp dist/index.html ../mindoc/views/document/index.html
rm -rf ../mindoc/assets
cp -r dist/assets ../mindoc/assets
npm run dev