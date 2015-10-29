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