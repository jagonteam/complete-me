// for gulp-mocha to compile es6 test on the fly
require('babel-core/register');

var gulp = require('gulp'),
    prettify = require('gulp-jsbeautifier'),
    runSequence = require('run-sequence'),
    gutil = require('gulp-util'),
    babel = require('gulp-babel'),
    mocha = require('gulp-mocha');
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css');

var paths = {
    scripts: [
        'client/js/*.js',
        'server/**/*.js',
        'test/**/*.js',
        'gulpfile.js'
    ],
    minify: [
        'assets/js/*.js',
        'server.js',
        'utils/*.js',
        'build/*.js'
    ],
    style: [
        'css/*.css'
    ],
    test: 'test/**/*.js'
};

gulp.task('minify-js', function() {
    gulp.src(paths.minify)
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
});

gulp.task('minify-css', function() {
    gulp.src(paths.style)
        .pipe(minifyCss())
        .pipe(gulp.dest('dist/style.css'));
})

gulp.task('verify-js', function() {
    gulp.src(['client/js/*.js'])
        .pipe(prettify({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_ONLY'
        }));
});

gulp.task('prettify-js', function() {
    gulp.src(paths.scripts)
        .pipe(prettify({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_AND_WRITE'
        }))
        .pipe(gulp.dest(function(file) {
            return file.base;
        }));
});

gulp.task('prettify-html', function() {
    gulp.src(['client/**/*.html'])
        .pipe(prettify({
            braceStyle: "collapse",
            indentChar: " ",
            indentSize: 4
        }))
        .pipe(gulp.dest('client/'));
});

gulp.task('prettify-code', function() {
    runSequence(
        ['prettify-js', 'prettify-html']
    );
});

gulp.task('transpilation', function() {
    gulp.src(['server/**/*.js'])
        .pipe(babel({
            highlightCode: false
        }))
        .pipe(gulp.dest('build/'))
        .on('error', gutil.log);
});

gulp.task('run-test', function() {
    gulp.src(paths.test, {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('error', gutil.log);
});

gulp.task('test', function() {
    runSequence('transpilation', 'run-test');
});

gulp.task('default', function() {
    runSequence('prettify-code', 'transpilation');
});
