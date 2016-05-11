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