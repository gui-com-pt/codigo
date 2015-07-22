(function(){

    angular
        .module('templates', []);

    angular
        .module('codigo.core', ['codigo']);

    angular
        .module('codigo.core.article', ['codigo.core']);

  angular
    .module('codigo', ['templates', 'pi.core', 'pi.core.app', 'pi.core.payment', 'pi.core.chat', 'pi.core.likes', 'pi.core.product', 'codigo.core', 'codigo.core.article',
      'ui.router', 'textAngular', 'infinite-scroll']);

  angular
    .module('codigo')
      .config(['$stateProvider', function($stateProvider){
          $stateProvider
              .state('home', {
                  url: '/',
                  templateUrl: 'core/home.tpl.html',
                  controller: 'codigo.core.homeCtrl',
                  controllerAs: 'ctrl'
              })
              .state('category-create', {
                  url: '/categoria-nova',
                  templateUrl: 'core/article/category-create.tpl.html',
                  controller: 'codigo.core.article.categoryCreateCtrl',
                  controllerAs: 'ctrl'
              })
              .state('category-list',{
                  url: '/categorias',
                  templateUrl: 'core/article/category-list.tpl.html',
                  controller: 'codigo.core.article.categoryListCtrl',
                  controllerAs: 'ctrl'
              })
              .state('article-create', {
                  url: '/artigo-novo',
                  templateUrl: 'core/article/article-create.tpl.html',
                  controller: 'codigo.core.article.articleCreateCtrl',
                  controllerAs: 'ctrl'
              })
              .state('article-view', {
                  url: '/artigo/:id',
                  templateUrl: 'core/article/article-view.tpl.html',
                  controller: 'codigo.core.article.articleViewCtrl',
                  controllerAs: 'ctrl'
              });

      }])
    .run(['$rootScope', 'pi.core.app.eventSvc', function($rootScope, eventSvc){
      eventSvc.find()
        .then(function(res){
          $rootScope.events = res.data.events;
        });
    }]);
})();

(function(){
    var SportsNewsListCtrl = function(articleSvc, $scope){
        var self = this;

        this.news = [];

        this.queryModel = {
            busy: false
        };

        $scope.$on('$destroy', function(){
            self.news = undefined;
        });

        this.query = function() {
            if(self.queryModel.busy) return;

            self.queryModel.busy = true;
            articleSvc.find({skip: self.news.length, take: 4}).then(function(r){
                if(r.data.articles.length < 1) return;

                angular.forEach(r.data.articles, function(event){
                    self.news.push(event);
                });

                self.queryModel.busy = false;
            }, function(){
                self.queryModel.busy = false;
            });
        };

    };

    SportsNewsListCtrl.$inject = ['pi.core.article.articleSvc', '$scope'];

    angular
        .module('codigo')
        .controller('codigo.core.homeCtrl', SportsNewsListCtrl);
})();
(function(){
    var SportsNewsCreateCtrl = function(articleSvc, $state){
        var self = this;
        this.model = {}; // the form model

        this.create = function(){
            var model = angular.copy(this.model);
            model.title = model.displayName;
            articleSvc.post(model).then(function(res){
                $state.go('article-list');
            });
        };
    };

    SportsNewsCreateCtrl.$inject = ['pi.core.article.articleSvc', '$state'];

    angular
        .module('codigo')
        .controller('codigo.core.article.articleCreateCtrl', SportsNewsCreateCtrl);
})();
(function(){
    var SportsNewsViewCtrl = function(articleSvc, $scope, $stateParams) {
        this.id = $stateParams.id;
        var self = this;
        articleSvc.get($stateParams.id)
            .then(function(res){
                self.sportsNews = res.data.article;
            });
    }
    SportsNewsViewCtrl.$inject = ['pi.core.article.articleSvc', '$scope', '$stateParams'];

    angular
        .module('codigo')
        .controller('codigo.core.article.articleViewCtrl', SportsNewsViewCtrl);
})();
(function(){
    angular
        .module('codigo.core.article')
        .controller('codigo.core.article.categoryCreateCtrl', ['pi.core.article.articleCategorySvc', '$state', function(categorySvc, $state){

            var self = this;
            this.model = {};

            this.create = function(){
                categorySvc.post(self.model)
                    .then(function(res){
                        $state.go('category-list');
                    });
            }
        }]);
})();
(function(){
    angular
        .module('codigo')
        .controller('codigo.core.article.categoryListCtrl', ['pi.core.article.articleCategorySvc', function(articleCategorySvc){
            var self = this;

            articleCategorySvc.find({})
                .then(function(res){
                    self.categories = res.data.categories;
                })
        }])
})();