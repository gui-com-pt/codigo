(function(){
"use restrict";

    angular
        .module('templates', []);

    angular
        .module('codigo.core', ['codigo']);

    angular
        .module('codigo.core.article', ['codigo.core']);

    angular
        .module('codigo.core.question', ['codigo.core']);

  angular
    .module('codigo', ['templates', 'pi.core', 'pi.core.app', 'pi.core.question', 'pi.core.payment', 'pi.core.chat', 'pi.core.likes', 'pi.core.product', 'codigo.core', 'codigo.core.article', 'codigo.core.question',
      'ui.router', 'textAngular', 'infinite-scroll', 'ngFileUpload', 'ui.select',
      'piClassHover', 'ngTagsInput', '720kb.socialshare']);

  angular
    .module('codigo')
      .config(['$stateProvider', 'uiSelectConfig', '$provide', 'tagsInputConfigProvider', function($stateProvider, uiSelectConfig, $provide, tagsInputConfigProvider){

          tagsInputConfigProvider
            .setDefaults('tagsInput', {
              placeholder: 'Nova Tag',
              minLength: 5,
              addOnEnter: false
            })
            .setDefaults('autoComplete', {
              debounceDelay: 200,
              loadOnDownArrow: true,
              loadOnEmpty: true
            })


          uiSelectConfig.theme = 'selectize';
          $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
              taOptions.toolbar = [
                  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
                  ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
                  ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
                  ['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
              ];

              taRegisterTool('titulo', {
                  iconclass: "fa fa-square red",
                  buttonText:' Titulo',
                  action: function(){
                      return this.$editor().wrapSelection("formatBlock", "<h2>");
                  }
              });
              taOptions.toolbar[0].push('titulo');


              taOptions.classes = {
                  focussed: 'focussed',
                  toolbar: 'btn-toolbar',
                  toolbarGroup: 'btn-group',
                  toolbarButton: 'btn btn-default',
                  toolbarButtonActive: 'active',
                  disabled: 'disabled',
                  textEditor: 'form-control',
                  htmlEditor: 'form-control'
              };
              return taOptions;
          }]);


          $stateProvider
              .state('home', {
                  url: '/',
                  templateUrl: 'core/home.tpl.html',
                  controller: 'codigo.core.homeCtrl',
                  controllerAs: 'ctrl'
              })
              .state('question-list',{
                  url: '/perguntas',
                  templateUrl: 'core/question/question-list.tpl.html',
                  controller: 'codigo.core.question.questionListCtrl',
                  controllerAs: 'ctrl'
              })
              .state('question-view', {
                  url: '/question/:id',
                  templateUrl: 'core/question/question-view.tpl.html',
                  controller: 'codigo.core.question.questionViewCtrl',
                  controllerAs: 'ctrl'
              })
              .state('category-create', {
                  url: '/categoria-nova',
                  templateUrl: 'core/article/category-create.tpl.html',
                  controller: 'codigo.core.article.categoryCreateCtrl',
                  controllerAs: 'ctrl'
              })
              .state('category-save', {
                  url: '/categoria-editar/:id',
                  templateUrl: 'core/article/category-save.tpl.html',
                  controller: 'codigo.core.article.categorySaveCtrl',
                  controllerAs: 'ctrl'
              })
              .state('category-list',{
                  url: '/categorias',
                  templateUrl: 'core/article/category-list.tpl.html',
                  controller: 'codigo.core.article.categoryListCtrl',
                  controllerAs: 'ctrl'
              })
              .state('article-list', {
                  url: '/artigos?name&categoryId',
                  templateUrl: 'core/article/article-list.tpl.html',
                  controller: 'codigo.core.article.articleListCtrl',
                  controllerAs: 'ctrl'
              })
              .state('article-create', {
                  url: '/artigo-novo',
                  templateUrl: 'core/article/article-create.tpl.html',
                  controller: 'codigo.core.article.articleCreateCtrl',
                  controllerAs: 'ctrl'
              })
              .state('article-save', {
                  url: '/artigo-editar/:id',
                  templateUrl: 'core/article/article-save.tpl.html',
                  controller: 'codigo.core.article.articleSaveCtrl',
                  controllerAs: 'ctrl'
              })
              .state('article-view', {
                  url: '/artigo/:id',
                  templateUrl: 'core/article/article-view.tpl.html',
                  controller: 'codigo.core.article.articleViewCtrl',
                  controllerAs: 'ctrl'
              });

      }])
    .run(['$rootScope', 'pi.core.article.articleCategorySvc', '$state',
          function($rootScope, categorySvc, $state){

          $rootScope.search = function(value) {
            $state.go('article-list', {name: value, categoryId: null});
          }
          categorySvc.find()
        .then(function(res){
          $rootScope.categories = res.data.categories;
        });
    }])
      .directive('ngPrism', ['$interpolate', function($interpolate){
              return {
                  restrict: 'AEC',
                  template: '<pre><code ng-transclude></code></pre>',
                  replace: true,
                  transclude: true,
                  link: function (scope, elm) {
                      var tmp = $interpolate(elm.find('code').text())(scope);
                      elm.find('code').html(Prism.highlightElement(tmp).value);
                  }
              };
          }])
      .directive('bindHtmlCompile', ['$compile', function ($compile) {
          return {
              restrict: 'A',
              link: function (scope, element, attrs) {
                  scope.$watch(function () {
                      return scope.$eval(attrs.bindHtmlCompile);
                  }, function (value) {
                      // Incase value is a TrustedValueHolderType, sometimes it
                      // needs to be explicitly called into a string in order to
                      // get the HTML string.
                      element.html(value && value.toString());
                      // If scope is provided use it, otherwise use parent scope
                      var compileScope = scope;
                      if (attrs.bindHtmlScope) {
                          compileScope = scope.$eval(attrs.bindHtmlScope);
                      }
                      $compile(element.contents())(compileScope);
                  });
              }
          };
      }]);;
})();
