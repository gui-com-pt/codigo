(function(){
    angular
        .module('codigo')
        .controller('codigo.core.article.categoryListCtrl', ['pi.core.article.articleCategorySvc', 'facebookMetaService', function(articleCategorySvc, facebookMetaService){
            var self = this;

            articleCategorySvc.find({})
                .then(function(res){
                    self.categories = res.data.categories;
                })
        }])
})();