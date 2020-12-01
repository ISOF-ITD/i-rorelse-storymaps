/*
*	Task Automation to make my life easier.
*	Author: Jean-Pierre Sierens
*	===========================================================================
*/
 
// declarations, dependencies
// ----------------------------------------------------------------------------
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var log = require('fancy-log');
var babelify = require('babelify');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var less = require('gulp-less');
var minifyCSS = require('gulp-csso');
var htmlmin = require('gulp-htmlmin');
var path = require('path');
var gulpif = require('gulp-if');
var del = require('del');


var production = false;

if (production) {
	process.env.NODE_ENV = 'production';
}

// Gulp tasks
// ----------------------------------------------------------------------------
gulp.task('scripts', () => bundleApp(production) );

gulp.task('deploy', () => bundleApp(true) );

gulp.task('less', function(){
    return gulp.src('./less/style-basic.less')
        .pipe(less({
			includePaths: ['node_modules']
		  }))
        .pipe(gulpif(production, minifyCSS({keepBreaks:true})))
        .pipe(gulp.dest('./static/i_rorelse/css'));
});

gulp.task('webfonts', function(){
	return gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/**.*')
		.pipe(gulp.dest('./static/i_rorelse/webfonts'));
});

gulp.task('markers', function(){
	return gulp.src('./node_modules/leaflet-extra-markers/src/assets/img/**.*')
		.pipe(gulp.dest('./static/i_rorelse/img'));
});

gulp.task('assets', gulp.series('webfonts', 'markers'));
 
gulp.task('watch', function (done) {
	gulp.watch(['./scripts/*.js', './scripts/*/*.js'], gulp.series('scripts'));
	gulp.watch(['./less/*ss', './less/*/*ss'], gulp.series('less'));
	done();
});
 
// When running 'gulp' on the terminal this task will fire.
// It will start watching for changes.
// If there's a change, the tasks defined in 'watch' above will fire.
gulp.task('default', gulp.series('scripts', 'less', 'assets', 'watch'));

// Intended for production build, without watch
gulp.task('build', gulp.series('deploy', 'less', 'assets'));
 
// Private Functions
// ----------------------------------------------------------------------------

// source: https://stackoverflow.com/a/23973536
function swallowError(error) {
	// If you want details of the error in the console
	console.log(error.toString())
	this.emit('end')
  }

// build Javascript
function bundleApp(isProduction) {
	// Browserify will bundle all our js files together in to one and will let
	// us use modules in the front end.
	var appBundler = browserify({
    	entries: './scripts/storymap.js',
    	debug: !isProduction
  	})
 
  	return appBundler
  		// transform ES6 and JSX to ES5 with babelify
		// .transform("babelify", {presets: ["@babel/preset-env", "@babel/preset-react"]})
	  	.transform("babelify", {presets: ["@babel/preset-env"]})
		.bundle()
		// do not interrupt when gulp produces error
	    .on('error', isProduction ? log : swallowError)
		.pipe(source('app.js'))
    	.pipe(buffer())
        .pipe(gulpif(isProduction, uglify()))
	    .pipe(gulp.dest('./static/i_rorelse/js/'));
}