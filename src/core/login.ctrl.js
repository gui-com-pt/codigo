(function(){
    var SportsNewsListCtrl = function(articleSvc, $scope){
        var self = this;


        self.loginError = function(){
          alert('erro no login');
        }

        self.loginSuccess = function(){
          alert('success');
        }
    };

    SportsNewsListCtrl.$inject = ['pi.core.article.articleSvc', '$scope'];

    angular
        .module('codigo')
        .controller('codigo.core.loginCtrl', SportsNewsListCtrl);
})();
(function(){
  angular
  .module('codigo')
  .directive('piLoginSubmit', [function(){
    var linkFn = function(scope, element, attrs, piLoginCtrl)
        {
            element.bind('click', function(){
                piLoginCtrl.submit();
            })
        };

        return {
            replace: false,
            link: linkFn,
            require:'^piLogin'
        }
  }])
  .directive('piLogin', ['accountApi', function(accountApi){
    var linkFn = function(scope, elem, attrs)
		{

		};
    var ctrl = function($scope){
      $scope.submit = function()
			{
				var successFn = function(res)
					{
						$scope.onSuccess(res);
					},
					errorFn = function(res)
					{
						$scope.onError(res);
					};

				accountApi.login($scope.email, $scope.password)
					.then(successFn, errorFn);
			};

      this.submit = $scope.submit;

			$scope.cancel = function()
			{

			};
    };
    ctrl.$inject = ['$scope'];

		return {
			scope: {
				'piConfig': '=piConfig',
        'onSuccess': '&',
        'onError': '&'
			},
			link: linkFn,
      controller: ctrl,
      replace: false
		};
  }]);
})();
