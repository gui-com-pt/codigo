(function(){
	
	angular
		.module('codigo')
		.provider('socialShare', [function(){

			var socials = ['facebook', 'google', 'twitter'],
				self = this;
			this.available = [];
			this.stacks = [];

			this.$get = function($modal){

				return {
					available: self.available,
					share: function(title, message, image, url, social) {
						self.stacks.push($modal.open({
							templateUrl: 'core/social/social-share-fb.modal.html',
							controller: 'socialShareModalCtrl',
							resolve: {
								image: function(){
									return image;
								},
								title: function(){
									return title;
								},
								message: function(){
									return message;
								}
							}
						}))
					}
				}
			}
			this.$get.$inject = ['$modal'];

			this.setAvailable = function(values) {
				self.available = values;
			}

		}])
		.controller('socialShareModalCtrl', ['$scope', 'title', 'image', 'message', '$modalInstance',
			function($scope, title, image, message, $modalInstance){
			$scope.image = image;
			$scope.title = title;
			$scope.message = message;

			$scope.cancel = function(){
				$modalInstance.dismiss();
			}
		}]);
})();