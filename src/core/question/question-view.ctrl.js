(function(){
    var SportsNewsViewCtrl = function(questionSvc, $scope, $stateParams) {
        this.id = $stateParams.id;
        var self = this;
        questionSvc.get($stateParams.id)
            .then(function(res){
                self.question = res.data.question;
            });
    }
    SportsNewsViewCtrl.$inject = ['pi.core.question.questionSvc', '$scope', '$stateParams'];

    angular
        .module('codigo')
        .controller('codigo.core.question.questionViewCtrl', SportsNewsViewCtrl);
})();