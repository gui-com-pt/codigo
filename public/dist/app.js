(function(){
"use restrict";
function getCookie(cname) {
        var name = cname + "=",
            ca = document.cookie.split(';'),
            i,
            c,
            ca_length = ca.length;
        for (i = 0; i < ca_length; i += 1) {
            c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) !== -1) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function setCookie(variable, value, expires_seconds) {
        var d = new Date();
        d = new Date(d.getTime() + 1000 * expires_seconds);
        document.cookie = variable + '=' + value + '; expires=' + d.toGMTString() + ';';
    }
var boot = function(){
         var initInjector = angular.injector(['ng']);
          var $http = initInjector.get('$http');
          var _response;

          $http.get('http://api.codigo.ovh/api/init').then(
              function(response) {
                  _response = response;
                  angular.module('config', []).constant('codigoModel', _response.data);

                  angular.element(document).ready(function() {
                      angular.bootstrap(document, ['codigo']);
                  });
              }
          );
  }

  boot();

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
      'ui.router', 'textAngular', 'infinite-scroll', 'ngFileUpload', 'ui.select', 'angularMoment', 'pi',
      'piClassHover', 'ngTagsInput', '720kb.socialshare', 'wu.masonry', 'config', 'angular-bind-html-compile']);

  angular
    .module('codigo')
      .config(['facebookMetaServiceProvider', 'piHttpProvider', '$locationProvider', '$stateProvider', 'uiSelectConfig', '$provide', 'tagsInputConfigProvider', '$httpProvider', '$urlRouterProvider', function(facebookMetaServiceProvider, piHttpProvider, $locationProvider, $stateProvider, uiSelectConfig, $provide, tagsInputConfigProvider, $httpProvider, $urlRouterProvider){
        
        $urlRouterProvider.otherwise('/');
        
        piHttpProvider.setBaseUrl('http://api.codigo.ovh');

        facebookMetaServiceProvider.setAuthor('https://www.facebook.com/living.with.jesus');
        facebookMetaServiceProvider.setPublisher('https://www.facebook.com/codigo.ovh');
        facebookMetaServiceProvider.setSiteName('Codigo');
        facebookMetaServiceProvider.setType('article');
        facebookMetaServiceProvider.setLocale('pt_PT');
        $locationProvider.hashPrefix('!');
        //$locationProvider.html5Mode(true);

        if(_.isString(getCookie('Authorization'))){
          var c = getCookie('Authorization');
          if(_.isString(c) && c.length > 4) {
              //var cookie = JSON.parse(decodeURIComponent(c));
              //if(!_.isUndefined(cookie.token))
                  $httpProvider.defaults.headers.common["WWW-Authenticate"] = 'Basic ' + c;
          }

      }
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
                  url: '/not-active',
                  templateUrl: 'core/home.tpl.html',
                  controller: 'codigo.core.homeCtrl',
                  controllerAs: 'ctrl'
              })
              .state('learn', {
                url: '/aprende-comigo',
                templateUrl: 'core/learn.tpl.html',
                controller: 'codigo.core.learnCtrl',
                controllerAs: 'ctrl'
              })
              .state('login', {
                url: '/login',
                templateUrl: 'core/login.tpl.html',
                controller: 'codigo.core.loginCtrl',
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
                  url: '/?name&categoryId',
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
    .run(['$rootScope', 'pi.core.article.articleCategorySvc', '$state', 'codigoModel', '$window', '$location',
          function($rootScope, categorySvc, $state, codigoModel, $window, $location){
            $rootScope.$location = $location;

            $rootScope.isAuthenticated = codigoModel.isAuthenticated;
            $rootScope.codigoModel = codigoModel;


             $rootScope.$on('$locationChangeStart', function () {
              Object.keys($window).filter(function(k) { return k.indexOf('google') >= 0 }).forEach(
                function(key) {
                  delete($window[key]);
                }
              );
            });

          $rootScope.search = function(value) {
            $state.go('article-list', {name: value, categoryId: null});
          }
          categorySvc.find()
        .then(function(res){
          $rootScope.categories = res.data.categories;
        });
    }])
    .directive('googleAdSense', function () {
        return {
            restrict: 'A',
            replace: true,       
            template: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1750926490246398" data-ad-slot="5417208575" data-ad-format="auto"></ins>',
            controller: function () {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        };
    });
})();

(function(){
  angular
    .module('codigo')
    .directive('codigoSidebar', ['pi.core.article.articleSvc', function(articleSvc){

      return {
        templateUrl: 'core/codigo-sidebar.tpl.html',
        replace: true,
        link: function(scope, elem, attrs) {
          scope.queryModel = {
            busy: false
          };
          scope.articles = [];

          articleSvc.find({}).then(function(r){

              if(!_.isArray(r.data.articles) || r.data.articles.length < 1) return;

              var articles = _.shuffle(r.data.articles);
              angular.forEach(articles, function(event){
                  scope.articles.push(event);
              });

              scope.queryModel.busy = false;
          }, function(){
              scope.queryModel.busy = false;
          });
        }
      }
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
            articleSvc.find({skip: self.news.length, take: 12}).then(function(r){
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
  angular
    .module('codigo')
    .controller('codigo.core.learnCtrl', [function(){

    }]);
})();

(function(){
    var SportsNewsListCtrl = function(articleSvc, $scope){
        var self = this;


        self.loginError = function(){
          alert('erro no login');
        }

        self.loginSuccess = function(){
          alert('success');
        }
    };

    SportsNewsListCtrl.$inject = ['pi.core.article.articleSvc', '$scope'];

    angular
        .module('codigo')
        .controller('codigo.core.loginCtrl', SportsNewsListCtrl);
})();
(function(){
  angular
  .module('codigo')
  .directive('piLoginSubmit', [function(){
    var linkFn = function(scope, element, attrs, piLoginCtrl)
        {
            element.bind('click', function(){
                piLoginCtrl.submit();
            })
        };

        return {
            replace: false,
            link: linkFn,
            require:'^piLogin'
        }
  }])
  .directive('piLogin', ['accountApi', function(accountApi){
    var linkFn = function(scope, elem, attrs)
		{

		};
    var ctrl = function($scope){
      $scope.submit = function()
			{
				var successFn = function(res)
					{
						$scope.onSuccess(res);
					},
					errorFn = function(res)
					{
						$scope.onError(res);
					};

				accountApi.login($scope.email, $scope.password)
					.then(successFn, errorFn);
			};

      this.submit = $scope.submit;

			$scope.cancel = function()
			{

			};
    };
    ctrl.$inject = ['$scope'];

		return {
			scope: {
				'piConfig': '=piConfig',
        'onSuccess': '&',
        'onError': '&'
			},
			link: linkFn,
      controller: ctrl,
      replace: false
		};
  }]);
})();

(function(){
	
	angular
		.module('codigo')
		.provider('socialShare', [function(){

			var socials = ['facebook', 'google', 'twitter'],
				self = this;
			this.available = [];
			this.stacks = [];

			this.$get = function($modal){

				return {
					available: self.available,
					share: function(title, message, image, url, social) {
						self.stacks.push($modal.open({
							templateUrl: 'core/social/social-share-fb.modal.html',
							controller: 'socialShareModalCtrl',
							resolve: {
								image: function(){
									return image;
								},
								title: function(){
									return title;
								},
								message: function(){
									return message;
								}
							}
						}))
					}
				}
			}
			this.$get.$inject = ['$modal'];

			this.setAvailable = function(values) {
				self.available = values;
			}

		}])
		.controller('socialShareModalCtrl', ['$scope', 'title', 'image', 'message', '$modalInstance',
			function($scope, title, image, message, $modalInstance){
			$scope.image = image;
			$scope.title = title;
			$scope.message = message;

			$scope.cancel = function(){
				$modalInstance.dismiss();
			}
		}]);
})();
(function(){
    var nutritionCard = function(ApiIsAuthorService, $rootScope)  {
        var link = function(scope, elem, attrs){
        }
        return {
          scope: {
              'article': '='
          },
          replace: true,
          templateUrl: 'core/article/article-card.tpl.html',
          link: link
        }
    };
    nutritionCard.$inject = ['ApiIsAuthorService', '$rootScope'];
    angular
        .module('codigo.core.article')
        .directive('codigoArticleCard', nutritionCard);

})();

(function(){
    var SportsNewsCreateCtrl = function(articleSvc, $state, $rootScope){
        var self = this;
        this.model = {}; // the form model

        this.create = function(){
            var model = angular.copy(this.model);
            model.title = model.displayName;
            model.keywords = [];
            angular.forEach(this.model.keywords, function(v, k){
                model.keywords.push(v.text);
            });
            if(!_.isUndefined(self.categorySelect)) {
                model.categoryId = self.categorySelect.id;
            }
            articleSvc.post(model).then(function(res){
                $rootScope.categories.push(res.data.category);
                $state.go('article-list');
            });
        };
    };

    SportsNewsCreateCtrl.$inject = ['pi.core.article.articleSvc', '$state', '$rootScope'];

    angular
        .module('codigo')
        .controller('codigo.core.article.articleCreateCtrl', SportsNewsCreateCtrl);
})();
(function(){
    var SportsNewsListCtrl = function(articleSvc, $scope, $stateParams){
        var self = this;

        this.news = [];

        this.queryModel = {
            busy: false
        };

        $scope.$on('$destroy', function(){
            self.news = undefined;
        });

        var getModelFromStateParams = function(names, model){

            angular.forEach(names, function(value){
                if(!_.isUndefined($stateParams[value])) {
                    model[value] = $stateParams[value];
                }
            });

            return model;
        }

        var getQueryModel = function(){
            var model = {skip: self.news.length, take: 12};
            getModelFromStateParams(['name', 'categoryId'], model);
            return model;
        }

        this.query = function() {
            if(self.queryModel.busy) return;

            self.queryModel.busy = true;
            articleSvc.find(getQueryModel()).then(function(r){
                if(!_.isArray(r.data.articles) || r.data.articles.length < 1) return;

                angular.forEach(r.data.articles, function(event){
                    self.news.push(event);
                });

                self.queryModel.busy = false;
            }, function(){
                self.queryModel.busy = false;
            });
        };

    };

    SportsNewsListCtrl.$inject = ['pi.core.article.articleSvc', '$scope', '$stateParams'];

    angular
        .module('codigo')
        .controller('codigo.core.article.articleListCtrl', SportsNewsListCtrl);
})();

(function(){
    var ctrl = function(articleSvc, $state, $stateParams){
        var self = this;
        this.model = {}; // the form model
        this.modelBusy = false;

        self.modelBusy = true;
        articleSvc.get($stateParams.id)
            .then(function(res){
                self.model = res.data.article;
                self.modelBusy = false;
            });

        this.save = function(){
            var model = angular.copy(this.model);
            model.title = model.displayName;
            if(!_.isUndefined(self.categorySelect)) {
                model.categoryId = self.categorySelect.id;
            }

            articleSvc.put($stateParams.id, model).then(function(res){
                $state.go('article-list');
            });
        };

        this.remove = function(){
            articleSvc.remove($stateParams.id).then(function(res){
                $state.go('article-list');
            });
        }
    };

    ctrl.$inject = ['pi.core.article.articleSvc', '$state', '$stateParams'];

    angular
        .module('codigo')
        .controller('codigo.core.article.articleSaveCtrl', ctrl);
})();
(function(){
    var SportsNewsViewCtrl = function(articleSvc, $scope, $stateParams, facebookMetaService) {
        this.id = $stateParams.id;
        var self = this;
        articleSvc.get($stateParams.id)
            .then(function(res){
                facebookMetaService.set(res.data.article.name, res.data.article.headline, res.data.article.image);
                self.sportsNews = res.data.article;
            });
    }
    SportsNewsViewCtrl.$inject = ['pi.core.article.articleSvc', '$scope', '$stateParams', 'facebookMetaService'];

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
(function(){
    angular
        .module('codigo.core.article')
        .controller('codigo.core.article.categorySaveCtrl', ['pi.core.article.articleCategorySvc', '$state', '$stateParams', function(categorySvc, $state, $stateParams){

            var self = this;
            this.model = {};
            categorySvc.get($stateParams.id)
                .then(function(res){
                    self.model = res.data.category;
                });

            this.remove = function(){
                categorySvc.remove($stateParams.id, self.model)
                    .then(function(res){
                        $state.go('category-list');
                    });
            }
            this.save = function(){
                categorySvc.put($stateParams.id, self.model)
                    .then(function(res){
                        $state.go('category-list');
                    });
            }
        }]);
})();
(function(){

    angular
        .module('codigo.core.question')
        .controller('codigo.core.question.questionCardCtrl', [function(){

        }])
        .directive('codigoQuestionCard', [function(){

            return {
                scope: {
                    'question': '='
                },
                replace: true,
                templateUrl: 'core/question/question-card.tpl.html',
                controller: 'codigo.core.question.questionCardCtrl'
            }
        }]);
})();
(function(){
    var ctrl = function(questionSvc, $scope, $stateParams){
        var self = this;

        this.questions = [];

        this.queryModel = {
            busy: false
        };

        $scope.$on('$destroy', function(){
            self.questions = undefined;
        });

        var getModelFromStateParams = function(names, model){

            angular.forEach(names, function(value){
                if(!_.isUndefined($stateParams[value])) {
                    model[value] = $stateParams[value];
                }
            });

            return model;
        }

        var getQueryModel = function(){
            var model = {skip: self.questions.length, take: 12};
            getModelFromStateParams(['name', 'categoryId'], model);
            return model;
        }

        this.query = function() {
            if(self.queryModel.busy) return;

            self.queryModel.busy = true;
            questionSvc.find(getQueryModel()).then(function(r){
                if(r.data.questions.length < 1) return;

                angular.forEach(r.data.questions, function(event){
                    self.questions.push(event);
                });

                self.queryModel.busy = false;
            }, function(){
                self.queryModel.busy = false;
            });
        };

    };

    ctrl.$inject = ['pi.core.question.questionSvc', '$scope', '$stateParams'];

    angular
        .module('codigo')
        .controller('codigo.core.question.questionListCtrl', ctrl);
})();
(function(){
    var SportsNewsViewCtrl = function(questionSvc, $scope, $stateParams) {
        this.id = $stateParams.id;
        var self = this;
        questionSvc.get($stateParams.id)
            .then(function(res){
                self.question = res.data.question;
            });
    }
    SportsNewsViewCtrl.$inject = ['pi.core.question.questionSvc', '$scope', '$stateParams'];

    angular
        .module('codigo')
        .controller('codigo.core.question.questionViewCtrl', SportsNewsViewCtrl);
})();