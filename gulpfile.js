const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const browsersync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const rev = require('gulp-rev');
const clean = require('gulp-clean');
const runsequence = require('run-sequence');
const notify = require("gulp-notify");

gulp.task('css', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({browsers: ['last 2 versions'],cascade: false}))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(rev())
        .pipe(gulp.dest('dist/css'))
        .pipe(browsersync.reload({stream: true}))
        .pipe(notify({message: 'Compiled CSS', onLast: 'true'}))
});

gulp.task('html', function() {
    return gulp.src('src/**/*.html')
        .pipe(newer('dist'))
        .pipe(htmlmin({removeComments: true,collapseWhitespace: true}))
        .pipe(gulp.dest('dist'))
        .pipe(browsersync.reload({stream: true}))
        .pipe(notify({message: 'Compiled HTML', onLast: 'true'}))
});

gulp.task('js', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(concat('scripts.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify({message: 'Compiled JS', onLast: 'true'}))
});

gulp.task('browsersync', function() {
    browsersync.init({
        server: {
            baseDir: 'dist'
        },
        open: false
    })
})

gulp.task('images', function() {
    return gulp.src('src/images/**/*.+(png|jpg|gif|svg)')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ]))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({message: 'Compiled Images', onLast: 'true'}))
})

gulp.task('clean', function() {
    return gulp.src('dist')
        .pipe(clean())
})

gulp.task('watch', function(callback) {
    runsequence('clean', 'html', 'css', 'js', 'images', 'browsersync', callback);
    gulp.watch('src/scss/**/*.scss', ['css']);
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/js/**/*.js', ['js']);
});

gulp.task('default', ['watch']);
