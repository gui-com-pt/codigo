(function(){

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
      'ui.router', 'textAngular', 'infinite-scroll', 'ngFileUpload', 'ui.select']);

  angular
    .module('codigo')
      .config(['$stateProvider', 'uiSelectConfig', function($stateProvider, uiSelectConfig){

          uiSelectConfig.theme = 'selectize';

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
    .run(['$rootScope', 'pi.core.article.articleCategorySvc', function($rootScope, categorySvc){


          categorySvc.find()
        .then(function(res){
          $rootScope.categories = res.data.categories;
        });
    }]);
})();
