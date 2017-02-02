/**
 * INFO: This gulpfile is only used for building the library and preparing/running the tests.
 */
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const shell = require('gulp-shell');
const del = require('del');
const argv = require('yargs');

const path = {
  destTest: 'build',
  destBuild: 'dist',
};

function dest(folder) {
  return gulp.dest(path.dest + (folder || ''));
}

gulp.task('clean', (cb) => {
  del([path.dest], { force: true }, cb);
});

gulp.task('lint', () => {
  gulp.src(['src/**/*.js', '!src/vendor/**']).pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// use ODL builder to build and package
gulp.task('test:package', () => {
  const odlBuilder = require('./src/odl/builder');

  // TEST: example ODL builder configuration for testing
  odlBuilder.buildPackage({
    outputPath: 'build',
    baseDir: './src/',
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

gulp.task('test:unit', shell.task([
  `./node_modules/.bin/mocha tests/specs${argv.only ? `/${argv.only}` : ''} --compilers js:babel-register --recursive --color`,
]));

gulp.task('test', ['test:unit', 'test:functional']);
