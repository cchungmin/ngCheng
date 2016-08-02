'use strict'

import gulp from 'gulp';
import webserver from 'gulp-webserver';
import gulpLoadPlugins from 'gulp-load-plugins';
import pkg from './package.json';
import ngAnnotate from'gulp-ng-annotate';
import rename from 'gulp-rename';
import argv from 'yargs';

const $ = gulpLoadPlugins();
const server = {
  host: 'localhost',
  port: '8001'
};

const args = argv.argv;

// Lint JavaScript
gulp.task('lint', () =>
  gulp.src(
    [
      '*.js',
    ])
    .pipe($.eslint())
    .pipe($.eslint.format())
);

// Optimize images
gulp.task('images', () =>
  gulp.src('images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}))
);

// Copy all files at the root level (app)
gulp.task('copy', () =>
  gulp.src([
    '*',
    '!*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    '*.scss',
    '*.css'
  ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(rename('min.css'))
    .pipe(gulp.dest('.'));
});

gulp.task('scripts', () =>
    gulp.src([
      // Note: Since we are not using useref in the scripts build pipeline,
      //       you need to explicitly list your scripts here in the right order
      //       to be correctly concatenated
      'main.js'
      // Other scripts
    ])
      // .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('min.js'))
      .pipe(ngAnnotate({
         // true helps add where @ngInject is not used. It infers.
         // Doesn't work with resolve, so we must be explicit there
         add: true
       }))
      .pipe($.uglify({preserveComments: 'some'}))
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('.'))
);

gulp.task('compile', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  gulp.src([
    // Note: Since we are not using useref in the scripts build pipeline,
    //       you need to explicitly list your scripts here in the right order
    //       to be correctly concatenated
    'main.js'
    // Other scripts
  ])
    .pipe($.babel())
    .pipe(rename('min.js'))
    .pipe(gulp.dest('.'))

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    '*.scss',
    '*.css'
  ])
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    // .pipe($.if('*.css', $.cssnano()))
    .pipe(rename('min.css'))
    .pipe(gulp.dest('.'))
});

gulp.task('webserver', () => {
  gulp.src('.')
    .pipe(webserver({
      host: server.host,
      port: server.port,
      livereload: true,
      directoryListing: false,
      middleware: [
        function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With, Accept');
          res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          next();
        }
      ],
    })
  );

  gulp.watch([
    '*.js',
    '*.css',
    '*.scss',
    '!gulpfile.babel.js',
    '!min.js'] ,
    ['compile', 'lint']);
});
