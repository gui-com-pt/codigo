(function(){
	angular
		.module('codigo.core')
		.factory('facebookMetaService', [function(){
			var _meta = {};

			return {
				clean: function(){
					_meta = {}
				},
				set: function(title, description, image) {
					_meta['og:locale'] = 'pt_PT';
					_meta['title'] = title;
					_meta['description'] = description;
					_meta['image'] = image;
				},
				meta: function(){
					return _meta;
				}
			}
		}])
		.directive('facebookMeta', [function(){
			return {
				replace: true,
				template: '<meta ng-repeat="(key, value) in $root.metas" property="{{key}}" content="{{value}}">',
				controller: ['$rootScope', '$scope', 'facebookMetaService', function($rootScope, $scope, facebookMetaService) {
					facebookMetaService.set('Codigo', 'Site de Programação', 'http://codigo.ovh/logo.png');
					$rootScope.metas = facebookMetaService.meta();
				}]
			}
		}])
})();