(function(){
    var nutritionCard = function(ApiIsAuthorService, $rootScope)  {
        var link = function(scope, elem, attrs){
          if(_.isUndefined(scope.showSocial)) {
            showSocial = true;
          }
        }
        return {
          scope: {
              'article': '=',
              'showSocial': '='
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
