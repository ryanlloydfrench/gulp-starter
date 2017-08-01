const gulp = require('gulp');
const inject = require('gulp-inject');
const browsersync = require('browser-sync').create();
const clean = require('gulp-clean');
const notify = require("gulp-notify");
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const size = require('gulp-size');

const paths = {
    src: 'src/**/*',
    srcHTML: 'src/**/*.html',
    srcCSS: 'src/**/*.css',
    srcSCSS: 'src/**/*.scss',
    srcJS: 'src/**/*.js',
    srcIMAGES: 'src/**/*.+(png|jpg|gif|svg)',
    tmp: 'tmp',
    tmpHTML: 'tmp/index.html',
    tmpCSS: 'tmp/**/*.css',
    tmpJS: 'tmp/**/*.js',
    dist: 'dist',
    distHTML: 'dist/index.html',
    distCSS: 'dist/**/*.css',
    distJS: 'dist/**/*.js'
};

gulp.task('html', function () {
    return gulp.src(paths.srcHTML)
        .pipe(gulp.dest(paths.tmp))
        .pipe(browsersync.reload({stream: true}))
        .pipe(notify({message: 'Compiled HTML', onLast: 'true'}))
});

gulp.task('html:dist', function () {
    return gulp.src(paths.srcHTML)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.dist))
        .pipe(browsersync.reload({stream: true}))
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(notify({message: 'Compiled HTML', onLast: 'true'}))
});

gulp.task('css', function () {
    return gulp.src(paths.srcSCSS)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(autoprefixer({browsers: ['last 2 versions'],cascade: false}))
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.tmp))
        .pipe(browsersync.reload({stream: true}))
        .pipe(notify({message: 'Compiled CSS', onLast: 'true'}))
});

gulp.task('css:dist', function () {
    return gulp.src(paths.srcSCSS)
        .pipe(sass())
        .pipe(autoprefixer({browsers: ['last 2 versions'],cascade: false}))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.dist))
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(notify({message: 'Compiled CSS', onLast: 'true'}))
});

gulp.task('js', function () {
    return gulp.src(paths.srcJS)
        .pipe(concat('script.js'))
        .pipe(gulp.dest(paths.tmp + '/js'))
        .pipe(browsersync.reload({stream: true}))
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
        .pipe(gulp.dest(paths.tmp))
        .pipe(notify({message: 'Compiled Images', onLast: 'true'}))
});

gulp.task('images:dist', function () {
    return gulp.src(paths.srcIMAGES)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest(paths.dist))
        .pipe(notify({message: 'Compiled Images', onLast: 'true'}))
});

gulp.task('copy', ['html', 'css', 'js', 'images']);

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist', 'images:dist']);

gulp.task('inject', ['copy'], function () {
    const css = gulp.src(paths.tmpCSS);
    const js = gulp.src(paths.tmpJS);
    return gulp.src(paths.tmpHTML)
        .pipe(inject( css, { relative:true } ))
        .pipe(inject( js, { relative:true } ))
        .pipe(gulp.dest(paths.tmp));
});

gulp.task('inject:dist', ['copy:dist'], function () {
    const css = gulp.src(paths.distCSS);
    const js = gulp.src(paths.distJS);
    return gulp.src(paths.distHTML)
        .pipe(inject( css, { relative:true } ))
        .pipe(inject( js, { relative:true } ))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('browsersync', ['inject'], function() {
    browsersync.init({
        server: {
            baseDir: paths.tmp
        },
        open: false
    })
})

gulp.task('clean:tmp', function () {
    return gulp.src(paths.tmp)
        .pipe(clean())
});

gulp.task('clean:dist', function () {
    return gulp.src(paths.dist)
        .pipe(clean())
});

gulp.task('watch', ['browsersync'], function () {
    gulp.watch(paths.src, ['inject']);
});

gulp.task('build', ['inject:dist']);

gulp.task('default', ['watch']);
