(function(){
	angular
		.module('codigo.core')
		.factory('facebookMetaService', [function(){
			var _meta = {};

			var setDefault = function() {
				_meta = {
					'og:site_name': 'Codigo',
					'og:type': 'article',
					'og:locale': 'pt_PT',
					'og:locale:alternate': 'pt_BR',
					'article:author': 'https://www.facebook.com/living.with.jesus',
					'article:publisher': 'https://www.facebook.com/codigo.ovh'
				};
			}

			setDefault();

			return {
				clean: function(){
					setDefault();
				},
				set: function(title, description, image) {
					_meta['og:locale'] = 'pt_PT';
					_meta['og:title'] = title;
					_meta['og:description'] = description;
					_meta['og:image'] = image;
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