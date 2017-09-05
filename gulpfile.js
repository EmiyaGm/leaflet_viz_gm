var babel        = require('gulp-babel');
var browserify   = require('browserify');
var derequire    = require('gulp-derequire');
var gulp         = require('gulp');
var insert       = require('gulp-insert');
var path         = require('path');
var rename       = require('gulp-rename');
var replace      = require('gulp-replace');
var source       = require('vinyl-source-stream');
var uglify       = require('gulp-uglify');
var concat       = require('gulp-concat');
var minifyCss    = require('gulp-minify-css');
var plumber      = require('gulp-plumber');

var BUILD = process.env.PARSE_BUILD || 'browser';
var VERSION = require('./package.json').version;

var PRESETS = {
    'browser': ['es2015', 'react', 'stage-2'],
    'node': ['es2015', 'react', 'stage-2'],
    'react-native': ['react'],
};
var PLUGINS = {
    'browser': ['inline-package-json', 'transform-inline-environment-variables', 'transform-runtime'],
    'node': ['inline-package-json', 'transform-inline-environment-variables', 'transform-runtime'],
    'react-native': ['inline-package-json', 'transform-inline-environment-variables'],
};

var Asset = {
    js: 'src/js/*.js',
    css: 'src/css/*.css',
    static: 'src/images'
};

var DEV_HEADER = (
    '/**\n' +
    ' * Mauna Map JavaScript Lib v' + VERSION + '\n' +
    ' *\n' +
    ' * The source tree of this library can be found at\n' +
    ' *   http://10.33.0.35/mauna/component-map\n' +
    ' */\n'
);

var FULL_HEADER = (
    '/**\n' +
    ' * Mauna Map JavaScript Lib v' + VERSION + '\n' +
    ' *\n' +
    ' * Copyright (c) 2017-present, Mauna, LLC.\n' +
    ' * All rights reserved.\n'
);

gulp.task('compile', function() {
    var packageJSON = {
        version: VERSION
    };
    return gulp.src('src/js/*.js')
        .pipe(plumber({}, true, function(err){
            console.log(err);
        }))
        .pipe(babel({
            presets: PRESETS[BUILD],
            plugins: PLUGINS[BUILD],
        }))
        // Second pass to kill BUILD-switched code
        .pipe(babel({
            plugins: ['minify-dead-code-elimination'],
        }))
        .pipe(gulp.dest(path.join('lib', BUILD)));
});

gulp.task('browserify', function() {
    var stream = browserify({
        builtins: ['_process', 'events'],
        entries: 'lib/browser/index.js',
        standalone: 'ComponentMap'
    })
    .exclude('xmlhttprequest')
    .ignore('_process')
    .bundle();

    return stream.pipe(source('mauna_map.js'))
        .pipe(derequire())
        .pipe(insert.prepend(DEV_HEADER))
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify', function() {
    gulp.src('dist/mauna_map.css') 
        .pipe(concat('mauna_map.min.css'))
        .pipe(minifyCss()) 
        .pipe(gulp.dest('dist'));
    
    return gulp.src('dist/mauna_map.js')
        .pipe(uglify())
        .pipe(insert.prepend(FULL_HEADER))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./dist'))
});

gulp.task('concat', function() {
    return gulp.src('src/css/*.css') 
        .pipe(concat('mauna_map.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('static',  function() {
    return gulp.src('src/images/*')
        .pipe(gulp.dest('dist/images'))
});

gulp.task('watch',  function() {
    return gulp.watch(Asset.js, ['compile']);
});