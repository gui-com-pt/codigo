(function(){
    var SportsNewsCreateCtrl = function(articleSvc, $state, $rootScope){
        var self = this;
        this.model = {}; // the form model

        this.reffers = [
        {
            name: 'Sapo',
            url: 'http://sapo.pt',
            image: 'http://www.sapo.pt/pt/img/logo.png'
        },
        {
            name: 'Diario de Viseu',
            url: 'http://www.diarioviseu.pt',
            image: 'http://www.diarioviseu.pt/sites/diarioviseu.pt/files/dv_0.png'
        },
        {
            name: 'Jornal de Noticias',
            url: 'http://www.jn.pt',
            image: 'http://www.lilireviews.com/wp-content/uploads/2015/11/Logo_jn.jpg'
        },
        {
            name: 'Diario As Beiras',
            url: 'http://www.asbeiras.pt',
            image: 'http://www.lilireviews.com/wp-content/uploads/2015/11/Logo_jn.jpg'
        },
        {
            name: 'Viseu Mais',
            url: 'http://viseumais.com',
            image: 'http://www.lilireviews.com/wp-content/uploads/2015/11/Logo_jn.jpg'
        },
        {
            name: 'Jornal Do Centro',
            url: 'http://www.jornaldocentro.pt',
            image: 'http://www.lilireviews.com/wp-content/uploads/2015/11/Logo_jn.jpg'
        }];

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

            if(!_.isUndefined(self.refferSelect)) {
                model.refferName = self.refferSelect.name;
                model.refferUrl = self.refferSelect.url;
                model.refferImage = self.refferSelect.image;
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