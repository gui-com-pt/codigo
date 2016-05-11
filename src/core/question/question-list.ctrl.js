(function(){
    var ctrl = function(questionSvc, $scope, $stateParams){
        var self = this;

        this.questions = [];

        this.queryModel = {
            busy: false
        };

        $scope.$on('$destroy', function(){
            self.questions = undefined;
        });

        var getModelFromStateParams = function(names, model){

            angular.forEach(names, function(value){
                if(!_.isUndefined($stateParams[value])) {
                    model[value] = $stateParams[value];
                }
            });

            return model;
        }

        var getQueryModel = function(){
            var model = {skip: self.questions.length, take: 12};
            getModelFromStateParams(['name', 'categoryId'], model);
            return model;
        }

        this.query = function() {
            if(self.queryModel.busy) return;

            self.queryModel.busy = true;
            questionSvc.find(getQueryModel()).then(function(r){
                if(r.data.questions.length < 1) return;

                angular.forEach(r.data.questions, function(event){
                    self.questions.push(event);
                });

                self.queryModel.busy = false;
            }, function(){
                self.queryModel.busy = false;
            });
        };

    };

    ctrl.$inject = ['pi.core.question.questionSvc', '$scope', '$stateParams'];

    angular
        .module('codigo')
        .controller('codigo.core.question.questionListCtrl', ctrl);
})();