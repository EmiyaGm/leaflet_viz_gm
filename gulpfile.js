/**
 * Created by gongmin on 2017/9/7.
 */
// 载入外挂
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    order = require("gulp-order"),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    webpack = require('gulp-webpack'),
    postcss = require("gulp-postcss"),
    sourcemaps = require("gulp-sourcemaps"),
    fileinclude = require('gulp-file-include') ;


// 样式
gulp.task('styles', function() {
    gulp.src('src/css/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('src/css'));
    gulp.src('src/css/*.css')
        .pipe(concat('gm_map.css'))
        .pipe(gulp.dest('dist/css'));
    return gulp.src('dist/css/gm_map.css')
        .pipe( sourcemaps.init() )
        .pipe( postcss([ require('precss'), require('autoprefixer') ]) )
        .pipe( sourcemaps.write('.') )
        .pipe(concat('gm_map.min.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'));
});

// 脚本
gulp.task('scripts', function(callback) {
    return gulp.src('src/entry.js')
        .pipe(webpack( require('./webpack.config.js') ))
        .pipe(gulp.dest('dist/js'));
});

// 图片
gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({ message: 'Images task complete' }));
});
//html
gulp.task('html', function() {
    return gulp.src('src/**/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(notify({ message: 'html task complete' }));
});
// 清理
gulp.task('clean', function() {
    return gulp.src(['dist/css', 'dist/js', 'dist/images'], {read: false})
        .pipe(clean());
});

// 预设任务
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images', 'html');
});


gulp.task('watch', function() {

    // 看守所有.scss档
    gulp.watch('src/css/**/*.scss', ['styles']);

    // 看守所有.js档
    gulp.watch('src/js/**/*.js', ['scripts']);

    // 看守所有图片档
    gulp.watch('src/images/**/*', ['images']);

    //看守html
    gulp.watch('src/**/*.html', ['html']) ;

    livereload.listen();
    gulp.watch(['dist/**']).on('change', livereload.changed);

});