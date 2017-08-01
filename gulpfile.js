const gulp = require('gulp');
const inject = require('gulp-inject');
const browsersync = require('browser-sync').create();
const clean = require('gulp-clean');

const paths = {
    src: 'src/**/*',
    srcHTML: 'src/**/*.html',
    srcCSS: 'src/**/*.css',
    srcJS: 'src/**/*.js',
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
        .pipe(gulp.dest(paths.tmp));
});

gulp.task('html:dist', function () {
    return gulp.src(paths.srcHTML)
        .pipe(gulp.dest(paths.dist));
});

gulp.task('css', function () {
    return gulp.src(paths.srcCSS)
        .pipe(gulp.dest(paths.tmp));
});

gulp.task('css:dist', function () {
    return gulp.src(paths.srcCSS)
        .pipe(gulp.dest(paths.dist));
});

gulp.task('js', function () {
    return gulp.src(paths.srcJS)
        .pipe(gulp.dest(paths.tmp));
});

gulp.task('js:dist', function () {
    return gulp.src(paths.srcJS)
        .pipe(gulp.dest(paths.dist));
});

gulp.task('copy', ['html', 'css', 'js']);

gulp.task('copy:dist', ['html:dist', 'css:dist', 'js:dist']);

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
