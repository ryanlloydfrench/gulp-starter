const gulp = require('gulp');
const inject = require('gulp-inject');
const browsersync = require('browser-sync').create();
const del = require('del');
const sequence = require('gulp-sequence');
const notify = require("gulp-notify");
const size = require('gulp-size');
const sizereport = require('gulp-sizereport');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const handlebars = require('gulp-compile-handlebars');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const uncss = require('gulp-uncss');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const revdel = require('gulp-rev-delete-original');
const imagemin = require('gulp-imagemin');
const githubpages = require('gulp-gh-pages');

const paths = {
    src: 'src',
    srcFILES: 'src/**/*',
    srcHTML: 'src/**/*.html',
    srcCSS: 'src/scss/**/*.scss',
    srcJS: 'src/js/**/*.js',
    srcIMAGES: 'src/images/**/*.+(png|jpg|gif|svg)',
    tmp: 'tmp',
    tmpHTML: 'tmp/index.html',
    tmpCSS: 'tmp/css/**/*.css',
    tmpJS: 'tmp/js/**/*.js',
    dist: 'dist',
    distHTML: 'dist/**/*.html',
    distCSS: 'dist/**/*.css',
    distJS: 'dist/**/*.js'
};

gulp.task('allfiles', function () {
    return gulp.src([paths.srcFILES, '!src/scss', '!src/scss/**/*', '!src/js', '!src/js/**/*', '!src/partials', '!src/partials/**/*', '!src/images', '!src/images/**/*'])
        .pipe(gulp.dest(paths.tmp))
});

gulp.task('allfiles:dist', function () {
    return gulp.src([paths.srcFILES, '!src/scss', '!src/scss/**/*', '!src/js', '!src/js/**/*', '!src/partials', '!src/partials/**/*', '!src/images', '!src/images/**/*'])
        .pipe(gulp.dest(paths.dist))
});

gulp.task('html', function () {
    const options = {
        ignorePartials: true,
        batch : [paths.src + '/partials']
    }
    return gulp.src(paths.srcHTML)
        .pipe(handlebars('',options))
        .pipe(gulp.dest(paths.tmp))
        .pipe(notify({message: 'Compiled HTML', onLast: 'true'}))
});

gulp.task('html:dist', function () {
    const options = {
        ignorePartials: true,
        batch : [paths.src + '/partials']
    }
    return gulp.src(paths.srcHTML)
        .pipe(handlebars('',options))
        .pipe(gulp.dest(paths.dist))
});

gulp.task('htmlmin:dist', ['html:dist'], function () {
    return gulp.src(paths.distHTML)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.dist))
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(notify({message: 'Compiled HTML', onLast: 'true'}))
});

gulp.task('css', function () {
    return gulp.src(paths.srcCSS)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(autoprefixer({browsers: ['last 2 versions'],cascade: false}))
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.tmp + '/css'))
        .pipe(notify({message: 'Compiled CSS', onLast: 'true'}))
});

gulp.task('css:dist', function () {
    return gulp.src(paths.srcCSS)
        .pipe(sass())
        .pipe(autoprefixer({browsers: ['last 2 versions'],cascade: false}))
        .pipe(uncss({html: [paths.srcHTML]}))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.dist + '/css'))
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(notify({message: 'Compiled CSS', onLast: 'true'}))
});

gulp.task('js', function () {
    return gulp.src(paths.srcJS)
        .pipe(concat('script.js'))
        .pipe(gulp.dest(paths.tmp + '/js'))
        .pipe(notify({message: 'Compiled JS', onLast: 'true'}))
});

gulp.task('js:dist', function () {
    return gulp.src(paths.srcJS)
        .pipe(concat('script.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist + '/js'))
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(notify({message: 'Compiled JS', onLast: 'true'}))
});

gulp.task('images', function () {
    return gulp.src(paths.srcIMAGES)
        .pipe(gulp.dest(paths.tmp + '/images'))
        .pipe(notify({message: 'Compiled Images', onLast: 'true'}))
});

gulp.task('images:dist', function () {
    return gulp.src(paths.srcIMAGES)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ],{verbose: true}))
        .pipe(gulp.dest(paths.dist + '/images'))
        .pipe(notify({message: 'Compiled Images', onLast: 'true'}))
});

gulp.task('copy', ['allfiles', 'html', 'css', 'js', 'images']);

gulp.task('copy:dist', ['allfiles:dist','htmlmin:dist', 'css:dist', 'js:dist', 'images:dist']);

gulp.task("revision:dist", ['copy:dist'], function(){
    return gulp.src([paths.distCSS, paths.distJS])
        .pipe(rev())
        .pipe(revdel())
        .pipe(gulp.dest(paths.dist))
        .pipe(rev.manifest())
        .pipe(gulp.dest(paths.dist))
})

gulp.task("revreplace:dist", ["revision:dist"], function(){
    const manifest = gulp.src(paths.dist + "/rev-manifest.json");
    return gulp.src(paths.dist + "/index.html")
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(paths.dist))
});

gulp.task('inject', ['copy'], function () {
    const css = gulp.src(paths.tmpCSS);
    const js = gulp.src(paths.tmpJS);
    return gulp.src(paths.tmpHTML)
        .pipe(inject( css, { relative:true } ))
        .pipe(inject( js, { relative:true } ))
        .pipe(gulp.dest(paths.tmp))
        .pipe(browsersync.stream())
});

gulp.task('inject:dist', ['revreplace:dist'], function () {
    const css = gulp.src(paths.distCSS);
    const js = gulp.src(paths.distJS);
    return gulp.src(paths.distHTML)
        .pipe(inject( css, { relative:true } ))
        .pipe(inject( js, { relative:true } ))
        .pipe(gulp.dest(paths.dist))
});

gulp.task('browsersync', ['inject'], function() {
    browsersync.init({
        server: {
            baseDir: paths.tmp
        },
        open: false,
        notify: false
    })
})

gulp.task('clean', function () {
    del.sync([paths.tmp])
});

gulp.task('clean:dist', function () {
    del.sync([paths.dist])
});

gulp.task('sizereport', function () {
	return gulp.src(paths.dist + '/**/*')
		.pipe(sizereport());
});

gulp.task('deploy', ['build'], function() {
    return gulp.src(paths.dist + '/**/*')
        .pipe(githubpages())
        .pipe(notify({message: 'Deployed Website', onLast: 'true'}))
});

gulp.task('watch', function (callback) {
    sequence('clean', ['browsersync'], callback)
    gulp.watch(paths.srcFILES, ['inject'])
});

gulp.task('build', function (callback) {
    sequence('clean:dist', ['inject:dist'], callback)
});

gulp.task('default', ['watch']);
