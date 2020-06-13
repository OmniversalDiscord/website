const fs = require('fs');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const uglifycss = require('uglifycss');
const minify = require('html-minifier').minify;
const sharp = require('sharp');

var buildDir = './build/';
var sourceDir = './site/';
var stylesFile = 'styles.css';
var htmlFile = 'index.html';
var backgroundFile = 'bg.png';

if (!fs.existsSync(buildDir)) {
    console.log(`Creating ${buildDir}`);
    fs.mkdirSync(buildDir);
}

const styles = fs.readFileSync(sourceDir + stylesFile).toString();
const html = fs.readFileSync(sourceDir + htmlFile).toString();
const bgImage = fs.readFileSync(sourceDir + backgroundFile);

postcss([ autoprefixer ])
    .process(styles, { from: sourceDir + stylesFile, to: buildDir + stylesFile})
    .then(result => {
        result.warnings().forEach(warn => {
            console.warn(warn.toString());
        });
        const uglified = uglifycss.processString(
            result.css
        );
        fs.writeFileSync(buildDir + stylesFile, uglified)
    });

const minifiedHTML = minify(html, {
    removeAttributeQuotes: true,
    minifyURLs: true,
    collapseWhitespace: true
});

fs.writeFileSync(buildDir + htmlFile, minifiedHTML);

sharp(bgImage)
    .resize(null, 1080)
    .webp()
    .toBuffer()
    .then(image => {
        fs.writeFileSync(buildDir + 'bg.webp', image);
    });

sharp(bgImage)
    .resize(null, 1080)
    .jpeg(
        {
            quality: 50,
            chromaSubsampling: "4:4:4"
        }
    )
    .toBuffer()
    .then(image => {
        fs.writeFileSync(buildDir + 'bg.jpg', image);
    });

fs.readdir(sourceDir + 'icons/', (err, files) => {
    files.forEach(file => {
        if (file.startsWith('apple') || file.startsWith('favicon')) {
            const icon = fs.readFileSync(sourceDir + 'icons/' + file);
            fs.writeFileSync(buildDir + file, icon);
        }
    });
});

console.log('Build complete');