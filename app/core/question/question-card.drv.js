(function(){

    angular
        .module('codigo.core.question')
        .controller('codigo.core.question.questionCardCtrl', [function(){

        }])
        .directive('codigoQuestionCard', [function(){

            return {
                scope: {
                    'question': '='
                },
                replace: true,
                templateUrl: 'core/question/question-card.tpl.html',
                controller: 'codigo.core.question.questionCardCtrl'
            }
        }]);
})();