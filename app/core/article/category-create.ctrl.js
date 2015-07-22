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