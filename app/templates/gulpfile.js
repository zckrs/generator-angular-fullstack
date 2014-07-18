'use strict';
// generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
// Node library

// NPM module
var _ = require('lodash');

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

<% var includeSass = false, includeBootstrap= false; %>


gulp.task('clean:server', require('del').bind(null, ['.tmp']));
gulp.task('clean:dist', require('del').bind(null, ['dist']));
gulp.task('clean', ['clean:server', 'clean:dist']);

gulp.task('env:test', function () {
  process.env = _.assign(process.env, { NODE_ENV: 'test' });
});
gulp.task('env:production', function () {
  process.env = _.assign(process.env, { NODE_ENV: 'production' });
});
gulp.task('env:all', function () {
  process.env = _.assign(process.env, require('./server/config/local.env'));
});

gulp.task('injector:less', function () {
  gulp.src('client/app/app.less')
    .pipe($.inject(gulp.src(["client/{app,components}/**/*.less", "!client/app/app.less"], {read: false}), {
      starttag: '// injector',
      endtag: '// endinjector',
      transform: function(filePath) {
        filePath = filePath.replace('/client/app/', '');
        filePath = filePath.replace('/client/components/', '');
        return '@import \'' + filePath + '\';';
      }
    }))
    .pipe(gulp.dest("client/app"));
});

gulp.task('serveNew', ['clean:server', 'env:all', 'injector:less']);









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
