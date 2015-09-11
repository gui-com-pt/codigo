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

          $http.get('/api/init').then(
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
    .module('pi-auth', ['pi']);

  angular
    .module('pi-auth')
    .provider('piConfiguration', function(){
      var config = function(){
        var m = {};
        m.providers = ['basic'];
        m.loginUri = '/login';
        m.logoutUri = '/logout';

        return m;
      };

      var provider = function(){
        var me = config();
        var configs = {};
        configs['default'] = me;

        me.config = function(configName) {
          var c = configs[configName];
          if(!c) {
            c = config();
            configs[configName] = c;
          }
          return c;
        };

        me.$get = ['$q', function($q){
          var deferred = $q.defer();

          return function(configName) {
            return configs[configName];
          }
        }];

        return me;

      };

      return provider();
    })
    .controller('registerCtrl', ['$scope', 'piConfiguration', 'accountApi', function($scope, piConfiguration, accountApi){
      $scope.init = function(configName) {
        var config = piConfiguration(configName);
      }

      $scope.register = function(firstName, lastName, email, password, passwordConfirm, meta) {
        var req = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password
        };

        if(meta) {
          req = angular.extend(req, meta)
        }

        accountApi.register(req)
          .then(function(res){
            window.location = '/';
          }, function(res){
            alert('erro no login');
          });
      }
    }])
    .directive('piRegister', ['$document', function($document){
      return {
        controller: 'registerCtrl',
        controllerAs: 'ctrl',
        transclude: true,
        replace: true,
        template: '<div ng-transclude></div>',
        compile: function compile(tElement, tAttrs, transclude) {
           return {
              pre: function preLink(scope, elemt, attrs, controller){

              },
              post: function postLink(scope, elem, attrs, ctrl) {
                var btn = angular.element(elem[0].querySelector('[login-submit]')),
                    mail = angular.element(elem[0].querySelector('[login-email]')),
                    pw = angular.element(elem[0].querySelector('[login-password]'));

                    if(navigator.appVersion.indexOf("Trident") != -1){
                        terminal.addClass('damn-ie');
                    }

                    var config = attrs['piConfig'];
                    scope.init(config || 'default');

                    var mouseover = false;

                    elem.on('mouseover', function(){
                      mouseover = true;
                    });

                    btn.on('click', function(){
                      scope.login(mail.val(), pw.val());
                    })

                    elem.on('mouseleave', function(){
                      mouseover = false;
                    });
              }
            }
          }
    }
    }])
    .controller('loginCtrl', ['$scope', 'piConfiguration', 'accountApi', function($scope, piConfiguration, accountApi){
      $scope.init = function(configName) {
        var config = piConfiguration(configName);
      }

      $scope.login = function(email, password) {
        accountApi.login(email, password)
          .then(function(res){
            window.location = '/';
          }, function(res){
            alert('erro no login');
          });
      }
    }])
    .directive('piAuth', ['$document', function($document){
      return {
        controller: 'loginCtrl',
        controllerAs: 'ctrl',
        transclude: true,
        replace: true,
        template: '<div ng-transclude></div>',
        compile: function compile(tElement, tAttrs, transclude) {
           return {
              pre: function preLink(scope, elemt, attrs, controller){

              },
              post: function postLink(scope, elem, attrs, ctrl) {
                var btn = angular.element(elem[0].querySelector('[login-submit]')),
                    mail = angular.element(elem[0].querySelector('[login-email]')),
                    pw = angular.element(elem[0].querySelector('[login-password]'));

                    if(navigator.appVersion.indexOf("Trident") != -1){
                        terminal.addClass('damn-ie');
                    }

                    var config = attrs['piConfig'];
                    scope.init(config || 'default');

                    var mouseover = false;

                    elem.on('mouseover', function(){
                      mouseover = true;
                    });

                    btn.on('click', function(){
                      scope.login(mail.val(), pw.val());
                    })

                    elem.on('mouseleave', function(){
                      mouseover = false;
                    });
              }
            }
          }
    }
    }]);

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
      'piClassHover', 'ngTagsInput', '720kb.socialshare', 'wu.masonry', 'pi-auth', 'config']);

  angular
    .module('codigo')
      .config(['$stateProvider', 'uiSelectConfig', '$provide', 'tagsInputConfigProvider', '$httpProvider', function($stateProvider, uiSelectConfig, $provide, tagsInputConfigProvider, $httpProvider){
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
                  url: '/',
                  templateUrl: 'core/home.tpl.html',
                  controller: 'codigo.core.homeCtrl',
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
    .run(['$rootScope', 'pi.core.article.articleCategorySvc', '$state', 'codigoModel',
          function($rootScope, categorySvc, $state, codigoModel){
            $rootScope.isAuthenticated = codigoModel.isAuthenticated;
            $rootScope.codigoModel = codigoModel;

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
