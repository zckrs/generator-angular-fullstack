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

var app;
gulp.task('express', ['autoprefixer'], function() {

  app = require('child_process').spawn('node', ['--debug', 'server/app.js']);
  app.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
    var str = data.toString().replace(/(\r?\n)/g, '');
    console.log('stdout: ' + str);
  });

  app.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  app.on('close', function (code, signal) {
    console.log('child process terminated due to receipt of signal '+signal);
  });

});
gulp.task('wait', ['express'], function(callback) {
  console.log('Wait express server start.');
  setTimeout(function () {
    callback();
  }, 1500);
});
gulp.task('open', ['wait'], function(callback) {
  require('open')('http://localhost:9000');
  callback();
});
gulp.task('quit', ['express'], function(callback) {
  setTimeout(function () {
      app.kill();
      callback();
  }, 100000);
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
    'autoprefixer',
    'express',
    'wait',
    'open',
    'watch'
  ],
  function () {


});



gulp.task('watch', ['open'], function () {
  $.livereload.listen();

  var watcherLess = gulp.watch('./client/{app,components}/**/*.less', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    app.kill();
    gulp.src('client/app/app.less')
      .pipe($.less({
        paths: [
          'client/bower_components',
          'client/app',
          'client/components'
        ]
      }))
      .pipe(gulp.dest('.tmp/app'));
    app = require('child_process').spawn('node', ['--debug', 'server/app.js']);
    app.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
      var str = data.toString().replace(/(\r?\n)/g, '');
      console.log('stdout: ' + str);
    });

    app.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    app.on('close', function (code, signal) {
      console.log('child process terminated due to receipt of signal '+signal);
    });

    console.log('Wait express server start.');

  });
  watcherLess.on('change', function (event) {
    setTimeout(function () {
      $.livereload.changed(event.path);
    }, 250);
  });
});
