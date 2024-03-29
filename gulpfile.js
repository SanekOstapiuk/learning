// Modules
const {parallel, series, src, dest, watch} = require('gulp');
const connect = require('gulp-connect');
const open = require('gulp-open');
const path = require('path');
const clean = require('gulp-clean');
const fs = require('fs');
const sass = require('gulp-sass');
const svgSprite = require('gulp-svg-sprite');

// Configs
const config = require('./configuration/base.json');

const fullPath = function (src) {
  return path.resolve(__dirname, src)
}

const startServer = function() {
  connect.server({
    root: config.root,
    livereload: config.livereload,
    port: config.port,
    host: config.host,
  })
}

const openBrowser = function(cb) {
  if (!config.open) {
    cb();
  } else {
    return src('.')
    .pipe(open({uri: `http://${config.host}:${config.port}`}))
  }
}

const startWatcher = function() {
  watch(fullPath(config.templates.input), buildIndex);
  watch(fullPath(config.styles.input), buildStyles);
  watch(fullPath(config.scripts.input), buildScripts);
  watch(fullPath(config.images.input), cpImages);
  watch(fullPath(config.svg.input), buildSVGSprite);
}

const cleanDist = function() {
  return src(fullPath(config.root), {read: false, allowEmpty: true})
  .pipe(clean());
}

const buildIndex = function() {
  return src(fullPath(config.templates.input))
  .pipe(dest(fullPath(config.templates.output)))
  .pipe(connect.reload());
}

const buildScripts = function() {
  return src(fullPath(config.scripts.input))
  .pipe(dest(fullPath(config.scripts.output)))
  .pipe(connect.reload());
}

const buildSVGSprite = function() {
  return src(fullPath(config.svg.input))
  .pipe(svgSprite(config.svg.conf))
  .pipe(dest(fullPath(config.svg.output)))
  .pipe(connect.reload())
}

const buildStyles = function() {
  return src(fullPath(config.styles.input))
  .pipe(sass().on('error', sass.logError))
  .pipe(dest(fullPath(config.styles.output)))
  .pipe(connect.reload());
}

const cpImages = function() {
  return src(fullPath(config.images.input))
  .pipe(dest(fullPath(config.images.output)))
  .pipe(connect.reload());
}

exports.default = series(
  cleanDist,
  parallel(
    buildIndex,
    buildScripts,
    buildStyles,
    buildSVGSprite,
    cpImages
  ),
  parallel(
    startServer,
    startWatcher,
    openBrowser
  )
);
