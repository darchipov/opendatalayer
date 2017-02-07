/**
 * INFO: This gulpfile is only used for building the library and preparing/running the tests.
 */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');
const connect = require('gulp-connect');
const del = require('del');
const argv = require('yargs').argv;
const path = require('path');

const config = {
  path: {
    destTest: 'build',
    destBuild: 'dist',
  },
};

function dest(folder) {
  return gulp.dest(config.path.destBuild + (folder || ''));
}

gulp.task('clean', (cb) => {
  del([config.path.dest], { force: true }, cb);
});

gulp.task('lint', () => {
  gulp.src(['src/**/*.js', '!src/vendor/**']).pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// use local ODL builder to build and package ODL with our testing plugins
gulp.task('test:package', () => {
  const odlBuilder = require('./src/odl/builder');

  // TEST: example ODL builder configuration for testing
  odlBuilder.buildPackage({
    outputPath: 'build',
    baseDir: path.resolve(__dirname),
    plugins: {
      'odl/plugins/ga': {
        config: {
          gaProdId: 'UA-123456',
        },
        rule: true,
      },
      'odl/plugins/marin': {
        config: {
          accountId: 'abc-1234abcd',
        },
        rule: '(data) => data.page.type === \'homepage\'',
      },
    },
  });
});

gulp.task('test:serve', () => {
  connect.server({
    root: 'tests/functional',
    port: 17771,
  });
});

gulp.task('test:prepare', () => {
  gulp.src('dist/*.js')
    .pipe(gulp.dest('tests/functional/.tmp'));
});

gulp.task('test:unit', shell.task([
  `./node_modules/.bin/mocha tests/specs${argv.only ? `/${argv.only}` : ''} --compilers js:babel-register --recursive --color`,
]));

gulp.task('test:functional', ['test:serve', 'test:prepare'], () => {
  const spawn = require('child_process').spawn;
  const testcafe = spawn('./node_modules/.bin/testcafe', ['chrome', 'tests', '-S', '--screenshots=./screenshots'], { stdio: 'inherit' });
  testcafe.on('close', () => {
    connect.serverClose();
  });
});

gulp.task('test', ['test:unit', 'test:functional']);
