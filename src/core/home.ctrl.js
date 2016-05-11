(function(){
    var SportsNewsListCtrl = function(articleSvc, $scope){
        var self = this;

        this.news = [];

        this.queryModel = {
            busy: false
        };

        $scope.$on('$destroy', function(){
            self.news = undefined;
        });

        this.query = function() {
            if(self.queryModel.busy) return;

            self.queryModel.busy = true;
            articleSvc.find({skip: self.news.length, take: 12}).then(function(r){
                if(r.data.articles.length < 1) return;

                angular.forEach(r.data.articles, function(event){
                    self.news.push(event);
                });

                self.queryModel.busy = false;
            }, function(){
                self.queryModel.busy = false;
            });
        };

    };

    SportsNewsListCtrl.$inject = ['pi.core.article.articleSvc', '$scope'];

    angular
        .module('codigo')
        .controller('codigo.core.homeCtrl', SportsNewsListCtrl);
})();