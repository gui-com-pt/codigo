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
