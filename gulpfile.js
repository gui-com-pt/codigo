var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    templateCache = require('gulp-angular-templatecache'),
    watch = require('gulp-watch'),
    inject = require('gulp-inject'),
    sass = require('gulp-sass'),
    requireDir = require('require-dir');

var tasks = requireDir('./bower_components/pi-gulp-tasks/tasks');

var paths = {
    dependencies: [
        './bower_components/ui-router/release/angular-ui-router.js',
        './bower_components/angular-bind-html-compile/angular-bind-html-compile.js',
        './bower_components/underscore/underscore.js',
        './bower_components/pi-class-hover/dist/pi-class-hover.js',
        './bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
        './bower_components/angular-facebook/lib/angular-facebook.js',
        './bower_components/ui-bootstrap/src/transition/transition.js',
        './bower_components/angular-growl-v2/build/angular-growl.js',
        './bower_components/ui-bootstrap/src/modal/modal.js',
        './bower_components/angular-resource/angular-resource.js',
        './bower_components/angular-datepicker/dist/index.js ',
        './bower_components/restangular/dist/restangular.js',
        './bower_components/moment/moment.js',
        './bower_components/moment/locale/pt.js',
        './bower_components/angular-masonry/angular-masonry.js',
        './bower_components/pi-class-hover/dist/pi-class-hover.js',
        './bower_components/moment-timezone/moment-timezone.js',
        './bower_components/angular-moment/angular-moment.js',
        './bower_components/angular-masonry-directive/src/angular-masonry-directive.js',
        './bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox.js',
        './bower_components/angular-google-places-autocomplete/src/autocomplete.js',
        './bower_components/ng-file-upload-shim/ng-file-upload-shim.js',
        './bower_components/ng-file-upload/ng-file-upload.js',
        './bower_components/angular-google-maps/dist/angular-google-maps.js',
        './bower_components/textAngular/dist/textAngular-rangy.min.js',
        './bower_components/textAngular/dist/textAngular-sanitize.min.js',
        './bower_components/textAngular/dist/textAngular.min.js',
        './bower_components/angular-ui-select/dist/select.js',
        './bower_components/angular-dragdrop/src/angular-dragdrop.min.js',
        './bower_components/angular-contenteditable/angular-contenteditable.js',
        './bower_components/prism/prism.js',
        './bower_components/ng-tags-input/ng-tags-input.js',
        './bower_components/angular-socialshare/dist/angular-socialshare.min.js'
    ],
    appModules: [
        './app/module.js',
        './app/**/module.js',
        './app/*.js',
        './app/**/*.js',
        './app/*.mdl.js',
        './app/common/*.mdl.js',
        './app/common/**/*.mdl.js',
        './app/common/**/**/*.mdl.js',
        './app/common/*.js',
        './app/common/**/*.js',
        './app/common/**/**/*.js',
        './app/core/*.mdl.js',
        './app/core/**/**/*.mdl.js',
        './app/core/**/*.mdl.js',
        './app/core/*.js',
        './app/core/**/*.js',
        './app/core/**/**/*.js'
    ]
};

gulp.task('scripts', function(){

    gulp.src(paths.appModules)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./public/dist'))
        .pipe(gulp.dest('./mobile/www/js/dist'));

    gulp.src(['./bower_components/volupio-angular/dist/volupio.js'])
        .pipe(concat('volupio.js'))
        .pipe(gulp.dest('./public/dist'));

    gulp.src(['./bower_components/volupio-angular/dist/volupio-biddy-angular.js'])
        .pipe(concat('volupio-biddy-angular.js'))
        .pipe(gulp.dest('./public/dist'));

    gulp.src(['./bower_components/pi-angular/dist/pi-angular.js'])
      .pipe(concat('pi-angular.js'))
      .pipe(gulp.dest('./public/dist'));

    gulp.src(['./bower_components/angular/angular.js', './bower_components/angular-i18n/angular-locale_pt.js'])
      .pipe(concat('angular.js'))
      .pipe(gulp.dest('./public/dist'));

    gulp.src([
        './bower_components/outlayer/item.js',
        './bower_components/outlayer/outlayer.js',
        './bower_components/masonry/masonry.js',
        './bower_components/imagesloaded/imagesloaded.js'
      ])
      .pipe(concat('masonry.js'))
      .pipe(gulp.dest('./public/dist'));

    gulp.src([
        './bower_components/outlayer/item.js',
        './bower_components/outlayer/outlayer.js',
        './bower_components/masonry/masonry.js',
        './bower_components/imagesloaded/imagesloaded.js'
      ])
      .pipe(concat('masonry.js'))
      .pipe(gulp.dest('./public/dist'));

    gulp.src([
      './bower_components/jquery/dist/jquery.js',
      './bower_components/jquery-ui/jquery-ui.js',
        './bower_components/jquery-bridget/jquery.bridget.js',
        './bower_components/get-style-property/get-style-property.js',
        './bower_components/get-size/get-size.js',
        './bower_components/eventEmitter/EventEmitter.js',
        './bower_components/eventie/eventie.js',
        './bower_components/doc-ready/doc-ready.js',
        './bower_components/matches-selector/matches-selector.js'
      ])
        .pipe(concat('jquery.js'))
        .pipe(gulp.dest('./public/dist'));
});

gulp.task('uglify', function() {
  gulp.src(paths.appModules)
    .pipe(uglify('app.min.js'))
    .pipe(gulp.dest('./public/dist'))
});

gulp.task('dependencies', function(){
   gulp.src(paths.dependencies)
       .pipe(concat('dependencies.js'))
       .pipe(gulp.dest('./public/dist'));
});

gulp.task('watch', function(){
    gulp.watch(paths.templates, ['templates']);
    gulp.watch(paths.appModules, ['scripts']);
    gulp.watch(paths.dependencies, ['dependencies']);
    gulp.watch(paths.sass, ['sass']);
});

gulp.task('default', ['scripts', 'dependencies', 'templates', 'inject-dist', 'sass']);
