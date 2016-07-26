'use strict'

import gulp from 'gulp';
import webserver from 'gulp-webserver';

var server = {
  host: 'localhost',
  port: '8001'
}

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
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('scripts', () =>
    gulp.src([
      // Note: Since we are not using useref in the scripts build pipeline,
      //       you need to explicitly list your scripts here in the right order
      //       to be correctly concatenated
      'public/js/scripts/main.js'
      // Other scripts
    ])
      // .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('main.min.js'))
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

gulp.task('sass', function () {
  gulp.src(sourcePaths.styles)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(distPaths.styles));
});

gulp.task('webserver', function() {
  gulp.src( '.' )
    .pipe(webserver({
      host: server.host,
      port: server.port,
      livereload: true,
      directoryListing: false,
      middleware: [
        function (req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
          res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
          next();
        }
      ],
    })
  );
});
