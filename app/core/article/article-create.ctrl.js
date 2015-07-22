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