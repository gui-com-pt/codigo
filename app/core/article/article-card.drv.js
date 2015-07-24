(function(){

    angular
        .module('codigo.core.article')
        .controller('codigo.core.article.articleCardCtrl', [function(){

        }])
        .directive('codigoArticleCard', [function(){

            return {
                scope: {
                    'article': '='
                },
                replace: true,
                templateUrl: 'core/article/article-card.tpl.html',
                controller: 'codigo.core.article.articleCardCtrl'
            }
        }]);
})();