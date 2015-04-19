var 	gulp = require('gulp'),
		prettify = require('gulp-jsbeautifier'),
		runSequence = require('run-sequence'),
		gutil = require('gulp-util'),
		babel = require('gulp-babel');

gulp.task('verify-js', function() {
	gulp.src(['assets/js/*.js'])
		.pipe(prettify({
			config: '.jsbeautifyrc',
			mode: 'VERIFY_ONLY'
		}));
});

gulp.task('prettify-js', function() {
	gulp.src(['assets/js/*.js'])
		.pipe(prettify({
			config: '.jsbeautifyrc',
			mode: 'VERIFY_AND_WRITE'
		}))
		.pipe(gulp.dest('assets/js/'));

	gulp.src(['server.js'])
		.pipe(prettify({
			config: '.jsbeautifyrc',
			mode: 'VERIFY_AND_WRITE'
		}))
		.pipe(gulp.dest('.'));

	gulp.src(['controllers/*.js'])
		.pipe(prettify({
			config: '.jsbeautifyrc',
			mode: 'VERIFY_AND_WRITE'
		}))
		.pipe(gulp.dest('controllers'));

	gulp.src(['utils/*.js'])
		.pipe(prettify({
			config: '.jsbeautifyrc',
			mode: 'VERIFY_AND_WRITE'
		}))
		.pipe(gulp.dest('utils'));
});

gulp.task('prettify-html', function() {
	gulp.src(['assets/**/*.html'])
		.pipe(prettify({
			braceStyle: "collapse",
			indentChar: " ",
			indentSize: 4
		}))
		.pipe(gulp.dest('assets/'));
});

gulp.task('prettify-code', function() {
	runSequence(
		['prettify-js', 'prettify-html']
	);
});

gulp.task('transpilation', function() {
	gulp.src(['controllers/*.js'])
		.pipe(babel({highlightCode: false}))
		.pipe(gulp.dest('build'))
		.on('error', gutil.log);
});


gulp.task('default', function() {
	runSequence(
		['prettify-code', 'transpilation']
	);
});
