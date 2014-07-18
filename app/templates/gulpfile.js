'use strict';
// generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
// Node library

// NPM module
var _ = require('lodash');
var del = require('del');
var wiredep = require('wiredep').stream;

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

<% var includeSass = false, includeBootstrap= false; %>


gulp.task('clean:server', function (callback) {
  del(['.tmp'], callback);
});

gulp.task('clean:dist', function (callback) {
  del(['dist'], callback);
});
gulp.task('clean', ['clean:server', 'clean:dist']);

gulp.task('env:test', function (callback) {
  process.env = _.assign(process.env, { NODE_ENV: 'test' });
  callback();
});
gulp.task('env:production', function (callback) {
  process.env = _.assign(process.env, { NODE_ENV: 'production' });
  callback();
});
gulp.task('env:all', function (callback) {
  process.env = _.assign(process.env, require('./server/config/local.env'));
  callback();
});

gulp.task('injector:less', ['env:all', 'clean:server'], function () {
  return gulp.src('client/app/app.less')
    .pipe($.inject(gulp.src([
        "client/{app,components}/**/*.less",
        "!client/app/app.less"
      ], {read: false}), {
      transform: function(filePath) {
        filePath = filePath.replace('/client/app/', '');
        filePath = filePath.replace('/client/components/', '');
        return '@import \'' + filePath + '\';';
      },
      starttag: '// injector',
      endtag: '// endinjector'
    }))
    .pipe(gulp.dest("client/app"));
});

gulp.task('injector:css', ['less'], function () {
  return gulp.src('client/index.html')
    .pipe($.inject(gulp.src('client/{app,components}/**/*.css', {read: false}), {
      transform: function(filePath) {
        filePath = filePath.replace('/client/', '');
        filePath = filePath.replace('/.tmp/', '');
        return '<link rel="stylesheet" href="' + filePath + '">';
      },
      starttag: '<!-- injector:css -->',
      endtag: '<!-- endinjector -->'
    }))
    .pipe(gulp.dest("client"));
});

gulp.task('injector:scripts', ['injector:css'], function () {
  return gulp.src('client/index.html')
    .pipe($.inject(gulp.src([
        "{.tmp,client}/{app,components}/**/*.js",
        '!{.tmp,client}/app/app.js',
        '!{.tmp,client}/{app,components}/**/*.spec.js',
        '!{.tmp,client}/{app,components}/**/*.mock.js'
      ], {read: false}), {
      transform: function(filePath) {
        filePath = filePath.replace('/client/', '');
        filePath = filePath.replace('/.tmp/', '');
        return '<script src="' + filePath + '"></script>';
      },
      starttag: '<!-- injector:js -->',
      endtag: '<!-- endinjector -->'
    }))
    .pipe(gulp.dest("client"));
});

gulp.task('less', ['injector:less'], function () {
   return gulp.src('client/app/app.less')
    .pipe($.less({
      paths: [
        'client/bower_components',
        'client/app',
        'client/components'
      ]
    }))
    .pipe(gulp.dest('.tmp/app'));
});

gulp.task('concurrent:server', ['less'], function (callback) {
  callback();
});

gulp.task('bowerInstall', ['injector:scripts'], function() {
  return gulp.src('client/index.html')
    .pipe(wiredep({
      ignorePath: 'client/',
      exclude: [/bootstrap-sass-official/, /bootstrap.js/, '/json3/', '/es5-shim/', /bootstrap.css/, /font-awesome.css/]
    }))
    .pipe(gulp.dest('client'));
});

gulp.task('autoprefixer', ['bowerInstall'], function() {
  return gulp.src('.tmp/{,*/}*.css')
    .pipe($.autoprefixer("last 1 version"))
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('serveNew',
  [
    'clean:server',
    'env:all',
    'injector:less',
    'concurrent:server',
    'injector:css',
    'injector:scripts',
    'bowerInstall',
    'autoprefixer'
  ],
  function () {


});









gulp.task('styles', function () {<% if (includeSass) { %>
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))<% } else { %>
  return gulp.src('app/styles/main.css')<% } %>
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['styles'], function () {<% if (includeBootstrap && includeSass) { %>
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap','fonts');<% } %>

  return gulp.src('app/*.html')
    .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
    .pipe($.if('*.js', $.uglify()))<% if (includeBootstrap && includeSass) { %>
    .pipe($.if('*.css', cssChannel()))<% } else { %>
    .pipe($.if('*.css', $.csso()))<% } %>
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  var streamqueue = require('streamqueue');
  return streamqueue({objectMode: true},
      $.bowerFiles(),
      gulp.src('app/fonts/**/*')
    )
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src(['app/*.*', '!app/*.html'], {dot: true})
    .pipe(gulp.dest('dist'));
});



gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({port: 35729}))
    .use(connect.static('app'))
    .use(connect.static('.tmp'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', connect.static('bower_components'))
    .use(connect.directory('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect'<% if (includeSass) { %>, 'styles'<% } %>], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;
<% if (includeSass) { %>
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({directory: 'bower_components'}))
    .pipe(gulp.dest('app/styles'));
<% } %>
  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'bower_components'<% if (includeSass && includeBootstrap) { %>,
      exclude: ['bootstrap-sass-official']<% } %>
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.<%= includeSass ? 'scss' : 'css' %>', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
