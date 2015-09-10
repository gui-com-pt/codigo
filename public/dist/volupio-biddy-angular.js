(function(){
    var configFn = function(){

    };

    var runFn = function($rootScope, auctionFollowSvc){
    	$rootScope.followSvc = auctionFollowSvc;
    };

    var fifiConfig = {

        wsEnabled: true,
        wsHost: '',
        wsAppId: 'b8de27e42b2d4c60e868',
        reputationVariant: 0.3,
        positionVariant: 0.7
    };
    var AUCTION_STATE = {
        'created': 1,
        'published': 2,
        'activate': 3,
        'completed': 4,
        'trash': 5,
        'pendingAccept': 6,
        'pendingSummary': 7
    };

    var ACCOUNT_STATE = {
        'pendingConfirmation': 1,
        'confirmed': 2,
        'suspended': 3,
        'banned': 4,
        'pendingPasswordChange': 5,
        'canceled': 6,
        'pendingProfile': 7,
        'pendingAdminConfirmaion': 8,
        'readonly': 99
    };

    var AUCTION_FOLLOW_STATE = {
        /* The auction hasn't started yet, it still has time left */
        'waiting': 0,
        /* Auction started but not bidded yet, it's pristine*/
        'pristine': 1,
        /* Auction started and the last bid was other user */
        'loosing': 2,
        /* Auction started and the last bid was the current user */
        'winning': 3,
        /* Auction has finished and the user didn't won */
        'lost': 4,
        /* Auction has finished and the user won */
        'won': 5
    };


    var profileType = {
        bidder: 1,
        contractor: 2,
        admin: 99
    };

    angular
        .module('fifi', ['volupio', 'pusher-angular'])
        .config(configFn)
        .run(['$rootScope', 'auctionFollowSvc', runFn])
        .constant('fifiConfig', fifiConfig)
         .constant('PROFILE_TYPE', profileType)
        .constant('AUCTION_STATE', AUCTION_STATE)
        .constant('ACCOUNT_STATE', ACCOUNT_STATE)
    /**
     * @ngdoc constant
     * @name jobsApp.AUCTION_FOLLOW_STATE
     *
     * @description
     * This states are for following auctions or active auctions
     * The directives will use the state to call the user atention with danger, warning classes
     * I've decided to also track before and after auction, in order to keep the recents auctions on the list
     */
        .constant('AUCTION_FOLLOW_STATE', AUCTION_FOLLOW_STATE)
        .provider("biddyConfiguration", function () {
            var appId = '', 
                appSecret = '',
                appKey = '',
                port = 4567,
                wsHost = 'pusher.com';

            this.setAppId = function (id) {
                appId = id;
            };

            this.setAppSecret = function(secret) {
                appSecret = secret;
            };

            this.setAppKey = function(key) {
                appKey = key;
            };

            this.setPort = function(port) {
                port = port;
            };

            this.setWsHost = function(host) {
                wsHost = host;
            };

            this.$get = function () {
                return {
                    wsHost: wsHost,
                    appId: appId,
                    appSecret: appSecret,
                    appKey: appKey,
                    port: port
                };
            };
        });
})();
(function(){
    var serviceFn = function($rootScope, $q, bidderSvc, modalSvc) {
                
        var getController = function() {
            var deferred = $q.defer();
            bidderSvc.getMyCategoriesCtrl().then(function(res) {
                deferred.resolve(res.data);
            }, function(res) {
                modalSvc.display(res);
            });
            return deferred.promise;
        };

        var add = function(id) {
            var deferred = $q.defer();
            bidderSvc.addCategory(id).then(function(res) {
                deferred.resolve(res.data);
                modalSvc.display(res.data);
            });
            return deferred.promise;
        };

        var remove = function(id){
            var deferred = $q.defer();
            bidderSvc.delCategory(id).then(function(res) {
                deferred.resolve(res.data);
                modalSvc.display(res.data);
            });
            return deferred.promise;
        };

        return {
            getController: getController,
            add: add,
            remove: remove
        };
    };

    serviceFn.$inject = ['$rootScope', '$q', 'bidderSvc', 'modalSvc'];

    var cntrlFn = function($scope, svc) {
        // Already registered categories
        $scope.userCategories = [];
        $scope.view = 'grid';
        $scope.userCategoriesIds = [];
        // All available categories for the user register
        $scope.categories = [];
        
        svc.getController().then(function(res) {
            $scope.usersCategories = res.userCategories;
            $scope.categories = res.categories;
            $scope.userCategoriesIds = res.userCategoriesIds;
            angular.forEach($scope.categories, function(value, key) {
               value['used'] = _.contains(res.userCategoriesIds, value.id);
            });
        });
        
        $scope.add = function(id) {
            svc.add(id).then(function(res) {
                $scope.userCategoriesIds.push(id);
                angular.forEach($scope.categories, function(value, key) {
                    if(value.id === id) {
                        $scope.categories[key]['used'] = true;
                    }
                });
            });
        };
        
        $scope.remove = function(id) {
            svc.remove(id).then(function(res) {
               for(var i = 0; i < $scope.userCategoriesIds.length; i++) {
                   if($scope.userCategoriesIds[i] === id) {
                       $scope.userCategoriesIds.splice(i, 1);
                   }
               }
               angular.forEach($scope.categories, function(value, key) {
                    if(value.id === id) {
                        $scope.categories[key]['used'] = false;
                    }
                });
            });
        };
    };

    cntrlFn.$inject = ['$scope', 'biddyBidderCategoriesSvc'];

    angular.module('fifi').
            factory('biddyBidderCategoriesSvc', serviceFn).
            controller('biddyBidderCategoriesCtrl', cntrlFn);
})();
(function(){

	 var bidDirective = function(modalSvc, jobSvc) {
        var cntrlFn = function($scope) {
            /**
             * Bid the auction
             * @param id {string} auction id
             * @param ammount {float} bid ammount
             */
            $scope.bid = function(id, ammount){
                $scope.canBid = false;
                $scope.busy = true;
                jobSvc.bidAuction(id, ammount).then(function(res) {
                    $scope.canBid = true;
                    $scope.busy = false;
                    $scope.userBid = null;
                    $scope.model.bidAmmount = '';
                }, function(res) {
                    modalSvc.display(res);
                    $scope.busy = false;
                    $scope.canBid = true;
                });
            };

            $scope.canBid = true;
            $scope.model = {};
        };

        return {
            replace: false,
            controller: ['$scope', cntrlFn]
        };
    };

	angular
	.module('fifi')
	.directive('auctionFollowBid', ['modalSvc', 'jobSvc', bidDirective])
})();
(function(){

    var directiveFn = function(){

        var linkFn = function(scope, elem, attrs) {
            elem.attr('src', '/uploads/user/' + attrs.bidderId + '_thumb.jpeg');
        };

        return {
            replace: false,
            link: linkFn
        };

    };

    angular
        .module('fifi')
        .directive('bidderImgSrc', directiveFn)
})();
(function(){

    var directiveFn = function(){

        var linkFn = function(scope, elem, attrs) {
            elem.attr('src', '/uploads/category/' + attrs.categoryId + '_thumb.jpeg');
        };

        return {
            replace: false,
            link: linkFn
        };

    };

    angular
        .module('fifi')
        .directive('categoryImgSrc', directiveFn)
})();
angular.module('fifi').
    directive('projectsFollowing', ['auctionFollowSvc', '$log', '$rootScope', 'modalSvc', function(auctionFollowSvc, $log, $rootScope, modalSvc) {
                return {
                    templateUrl: function(elem,attrs) {
                        return attrs.templateUrl || '/volupio/biddy/project/follow.html'
                    },
                    replace: false,
                    scope: {
                        total: '='
                    },
                    controller: ['$scope', function($scope) {

                        $scope.userId = $rootScope.userId;

                        $scope.$on('bid', function(event, res) {
                            var a = false, // aux project found
                            i = 0, // aux project index
                            id = res.projectId; // project id
                            angular.forEach($scope.projects, function(value, key) {
                                if(value.id === id && !auctionFollowSvc.isCurrentView(value.id)) {
                                    a = true;
                                    i = key;
                                }
                                if(a) {
                                    return false;
                                }
                            });

                            if(a) {
                                $scope.$apply(function(){
                                    $scope.projects[i].newBid = true;
                                });
                            }
                        });

                        $scope.endBidderProject = function(id){
                            modalSvc.confirm('Acabar', '<p>O projeto encontra-se em fase de revisão.</p><p>Pode terminar a sua participação, e será notificado quando for anunciado o vencedor do concurso.</p>', 'Terminar', 'Cancelar')
                                .then(function(res) {
                                   auctionFollowSvc.endBidderProject(id);
                                });
                        }
                    }]
                };
            }]);
angular.module('fifi').
directive('ifileUpload', ['$log', function($log) {
                return {
                    scope: true, //create a new scope
                    link: function(scope, el, attrs) {
                        el.bind('change', function(event) {
                            $log.info('file changed');
                            var files = event.target.files;
                            //iterate files since 'multiple' may be specified on the element
                            for (var i = 0; i < files.length; i++) {
                                //emit event upward
                                scope.$emit("fileSelected", {file: files[i]});
                            }
                        });
                    }
                };
            }]);
(function(){
    angular.module('fifi').
            service('biddyProjectService', ['projectSvc', 'jobSvc', 'auctionFollowSvc', '$q', '$rootScope',
                function(projectSvc, jobSvc, auctionFollowSvc, $q, $rootScope) {
                
                this.isFollowingAuction = function(id){
                    return auctionFollowSvc.isFollowingAuction(id);
                };

            this.isFollowingProject = function(id) {
                return auctionFollowSvc.isFollowing(id);
            };
             

            }]).
            directive('biddyProject', ['projectSvc', 'jobSvc', '$sce', 'biddyProjectService', '$rootScope',
    function(projectSvc, jobSvc, $sce, biddyProjectService, $rootScope) {
        return {
            replace: false,
            link: function(scope, element, attrs) {
                var id = scope.$eval(attrs.project).id,
                        trusted = {};

                scope.isFollowingProject = function(){
                    return $rootScope.followSvc.isFollowing(id);
                };

                if(scope.isFollowing) {
                    console.log('following this project');
                }
                
                scope.getContentHtml = function(html) {
                    return trusted[html] || (trusted[html] = $sce.trustAsHtml(html));
                };

            }
        };
    }]);
})();
(function(){
  // widget-editor-service.js
    angular.module('fifi').service('widgetEditor', ['$modal', '$q', '$templateCache', function ($modal,$, $templateCache) {
    return function(widgetObject) {
      var deferred = $q.defer();

      var templateId = _.uniqueId('widgetEditorTemplate');
      $templateCache.put(templateId, require('./widget-editor-template.html'));

      var dialog = $modal({
        template: templateId
      });

      dialog.$scope.widget = widgetObject;

      dialog.$scope.save = function() {
        // Do some saving things
        deferred.resolve();
        dialog.destroy();
      };

      dialog.$scope.cancel = function() {
        deferred.reject();
        dialog.destroy();
      };

      return deferred.promise;
    
    };
  }]);

})();
(function(){
    var svcFn = function(api, $q, modalSvc, $state) {

        var create = function(name, content, parentId) {
            var deferred = $q.defer(),
                request = {
                    name: name,
                    content: content
                };
            if(!_.isEmpty(parentId)) {
                request.parent = parentId;
            }
            api.post(request).then(function(res) {
                deferred.resolve(res.data);
            }, function(res) {
                deferred.reject(res);
            });

            return deferred.promise;
        };
        
        var getModel = function(skip, take)  {
            var deferred = $q.defer();
            api.get().then(function(res) {
                deferred.resolve({
                    categories: res.data.results
                }, function(res) {
                    deferred.reject(res.data);
                });
            });
            return deferred.promise;
        };
        return {
            create: create,
            getModel: getModel
        };
    };

    svcFn.$inject = ['auctionCategoryApi', '$q', 'modalSvc', '$state'];
    
    angular
        .module('fifi')
        .service('auctionCategoryCreateSvc', svcFn);
})();
angular.module('fifi').
        factory('adminSvc', ['$q', '$rootScope', 'usersPendingFactory', 'auctionFollowSvc',
    function($q, $rootScope, usersPendingFactory, auctionFollowSvc) {
        var svc = {};
        
        /**
         * Init method
         * 
         * Starts admin configuration
         * @param array model Init response returned by API
         * @returns {undefined}
         */
        svc.init = function(model) {
            var pendingSvc = new usersPendingFactory(parseInt(model.usersPendingAdmin));
            //$rootScope.usersPendingAdmin = model.usersPendingAdmin;
            auctionFollowSvc.setProjects(model.projectsActive);
            $rootScope.usersPendingSvc = pendingSvc;
            $rootScope.isAdmin = true;
        };
        
        return svc;
    }])
        .factory('usersPendingFactory', ['$rootScope', function($rootScope) {
                
                var svc = function(pendingCounter){
                    this.pendingCounter = pendingCounter;
                    this.increase = function(total) {
                        this.pendingCounter = this.pendingCounter + (_.isNumber(total) ? total : 1);
                    };
                    
                    this.decrease = function(total) {
                        this.pendingCounter = this.pendingCounter - (_.isNumber(total) ? total : 1);
                    };
                    
                };
        
                return svc;
        }]);
(function(){
    var svcFn = function($q, $http) {

        this.getController = function(){
            var deferred = $q.defer(),
                successFn = function(res) {
                    deferred.resolve(res.data);
                },
                errorFn = function(res) {
                    deferred.reject(res);
                },
                httpConfig = {
                    url: '/admin.json',
                    method: 'GET'
                };

            $http(httpConfig)
                .then(successFn, errorFn);

            return deferred.promise;
        }
    };

    angular
        .module('fifi')
        .service('adminFactory', ['$q', '$http', svcFn]);
})();
/*
 * AngularJS module for Volupio API's
 * This implementation follow guidelines that will be shared across several projects
 * The API is based on Laravel 
 */
var module;
module =  angular.module('fifi');

/*
 * Configuration for Volupio API
 */
module.provider('volupioRestConfig', function(){
    var restConfig;
    restConfig = {
    /*
     * Url Prefix. Ie: /api/v3/jobs
     */
      urlPrefix: "",
      /*
       * Max retries the client will retry when a internal server error is detected
       * Bad requests aren't retried 
       */
      maxRetries: 3,
      /*
       * Function to handle unauthorized exceptions 
       */
      unauthorizedFn: null
  };
  return {
    setRestConfig: function(newConfig) {
        return angular.extend(restConfig, newConfig);
    },  
    $get: function(){
        return restConfig;
    }
  };
});
module.factory('volupioApiClient', 
['volupioRestConfig', '$http', '$q', '$timeout', '$location', '$log', function(volupioRestConfig, $http, $q, $timeout, $location, $log){
     var restClient, RestResponse;
     /*RestResponse
      * This 
      */
     RestResponse = (function(){
         /*
          * Constructor
          */
         function RestResponse(response) {
             var _ref, _r1, _r2, _r3, _r4, _r5;
             this.response = response;
             /*
              * Success on the request depends on response status property. Between 200 and 300 is OK
              */
             this.success = (200 <= (_ref = this.response.status) && _ref < 300);
             this.statusCode = this.response.status;
             
             if(this.success) {
                 this.data = this.response.data;
             }
             else {
                 this.error = (_r1 = this.response) != null
                 ? (_r2 = _r1.data) != null
                    ? _r2.responseStatus
                    : void 0
                 : void 0;
             }
             this.headers = this.response.headers;
             this.config = this.response.config;   
         }
         RestResponse.prototype.getConfig = function(){
             return this.response.config;
         }
         RestResponse.prototype.hasValidationError = function(){
           var _ref;
           return ((_ref = this.validationErrors) != null 
           ? _ref.length
           : void 0) > 0;
         };
         /*
          * Indicates if the request was sucefully authenticated
          * @returns {Boolean}
          */
         RestResponse.prototype.isUnauthenticated = function(){
             return this.statusCode === 401;
         }
         
         return RestResponse;
     });
     
     
     /*
      * Rest client
      */
     restClient = (function(){
         function restClient() { }
         
         /*
          * This function clears a url
          * Code injection is validated at server side, but i'll make a few tweeks also on clientside
          * @param {type} url
          * @returns {String}
          */
         restClient.prototype.fixUrl = function(url) {
          var prefix, result;
          if (0 === url.indexOf(volupioRestConfig.urlPrefix)) {
            return url;
          } else {
            $log.log("Fixing url: " + url);
            prefix = serviceStackRestConfig.urlPrefix.replace(/\/+$/, "");
            url = url.replace(/^\/+/, "");
            result = "" + prefix + "/" + url;
            $log.log("to url: " + prefix + "/" + url);
            return result;
          }
        };
         /*
          * Delete method
          * Keep 'delete' as dictionary instead of object property because delete is reserved on IE
          */
         restClient.prototype['delete'] = function(url, config) {
             if(config == null)
                 config = {};
             config.method = 'DELETE';
             config.url = url;
             return this.execute(config);
         };
         /*
          * Get Method
          */
         restClient.prototype.get = function(url, config) {
             if(config == null)
                 config = {};
             config.method = 'GET';
             config.url = url;
             return this.execute(config);
         };
         /*
          * Post Method
          */
         restClient.prototype.post = function(url, data, config) {
             if(config == null)
                 config = {};
             config.method = 'POST';
             config.url = url
             config.data = data;
             return this.execute(config);
         };
         /*
          * Put method
          */
         restClient.prototype.put = function(url, config) {
             if(config == null)
                 config = {};
             config.method = 'PUT';
             config.url = url;
             return this.execute(config);
         };
         /*
          * Execute a API call
          */
         restClient.prototype.execute = function(config) {
             var successFn, validationFn, errorFn, defer, promise;
             sucessFn = [];
             validationFn = [];
             errorFn = [];
             successFn = [];
             defer = $q.defer();
             
             promise = $http(config);
             promise.then(function(response) {
                 
                 // Success
                 var result;
                 result = new RestResponse(response);
                 return defer.resolve(result);
             }, function(response) {
                 
             // Invalid
                 var resul = new RestResponse(response);
                 return defer.reject(result);
             });
             defer.promise.error = function(fn) {
                 errorFn.push(fn);
             }
             return defer.promise;
         };
         return restClient;
     });
     return new restClient();
}])
.service('apiSvc', ['$http', function($http) {
    return {
        get: function(){
            
        }
    };
}]);
angular.module('fifi').
        service('auctionCategoryApi', ['$http', '$q', '$log', function($http, $q, $log) {
                this.post = function(dto) {
                    return $http({
                        url: '/api/category',
                        method: 'POST',
                        data: dto
                    });
                };
                
                this.get = function(){
                    return $http({
                        url: '/api/category',
                        method: 'GET'
                    });
                };
                
                this.getById = function(id) {
                    return $http({
                       url: '/api/category/' + id,
                       method: 'GET'
                    });
                };
                
                this.viewCtrl = function(id) {
                    return $http.get('/categories.json/' + id);
                };
            }]);
(function(){
	var service = function($http, $q) {

		this.acceptProject = function(bidId) {
			var deferred = $q.defer(),
				successFn = function(res) {
					deferred.resolve(res);
				},
				errorFn = function(res) {
					deferred.reject(res);
				},
				httpObj = {
					url: '/api/accept/project/' + bidId,
					method: 'POST'
				};

				$http(httpObj)
					.then(successFn, errorFn);

				return deferred.promise;
		};

		this.acceptAuction = function(bidId, aunctionId) {
			var deferred = $q.defer(),
				successFn = function(res) {
					deferred.resolve(res);
				},
				errorFn = function(res) {
					deferred.reject(res);
				},
				httpObj = {
					url: '/api/accept/auction/' + bidId + '/' + aunctionId,
					method: 'POST'
				};

				$http(httpObj)
					.then(successFn, errorFn);

				return deferred.promise;
		};

	};

	angular
		.module('fifi')
		.service('bidAcceptApi', ['$http', '$q', service]);
})();
(function(){
	var svc = function($http, $q){

		this.get = function(id) {
			var deferred = $q.defer(),
			successFn = function(res) {
				deferred.resolve(res.data);
			},
			errorFn = function(res) {
				deferred.reject(res);
			},
			httpObj = {
				url: '/api/bid/summary/' + id,
				method: 'GET'
			};

			$http(httpObj)
				.then(successFn, errorFn);

			return deferred.promise;
		};


		this.find = function(projectId, model) {

			var deferred = $q.defer(),
				successFn = function(res) {
					deferred.resolve(res.data);
				},
				errorFn = function(res) {
					deferred.reject(res);
				},
				httpObj = {
					url: '/api/project/' + projectId + '/summary',
					method: 'GET',
					params: model
				};

			$http(httpObj)
				.then(successFn, errorFn);

			return deferred.promise;
		};

		this.findByUser = function(userId, model) {
				var deferred = $q.defer(),
				successFn = function(res) {
					deferred.resolve(res.data);
				},
				errorFn = function(res) {
					deferred.reject(res);
				},
				httpObj = {
					url: '/api/bidder/summary/' + userId,
					method: 'GET',
					params: model
				};

			$http(httpObj)
				.then(successFn, errorFn);

			return deferred.promise;
		};

		this.postReputation = function(bidId, reputation) {
			var model = {
					id: bidId,
					reputation: reputation
				},
				deferred = $q.defer(),
				successFn = function(res) {
					deferred.resolve(res.data);
				},
				errorFn = function(res) {
					deferred.reject(res);
				},
				httpObj = {
					url: '/api/bid/reputation',
					method: 'POST',
					data: model
				};
				
			$http(httpObj)
				.then(successFn, errorFn);

			return deferred.promise;
		}
	};

	angular
		.module('fifi')
		.service('bidSummaryApi', ['$http', '$q', svc]);
})();
angular.module('fifi').
        service('bidderSvc', ['$q', 'Restangular', 'auctionFollowSvc', '$rootScope', '$http',
            function($q, Restangular, auctionFollowSvc, $rootScope, $http) {
                var bidderSvc = {};
                
                /**
                 * Initialize Bidder 
                 * 
                 * @param object model
                 */
                bidderSvc.init = function(model) {
                    $rootScope.isBidder = true;
                    $rootScope.userRank = {
                                    profile: 1,
                                    auctionsDone: model.rank.auctionsDone,
                                    auctionsWinned: model.rank.auctionsWinned,
                                    reputation: model.rank.reputation,
                                    technicalTeam: 0,
                                    level: 0,
                                    generalExperience: 0
                                };
                                
                    $rootScope.followSvc.setAuctions(model.auctionsFollowing);
                    $rootScope.followSvc.setProjects(model.projectsFollowing);
                    $rootScope.followSvc.enableWsIfActive();
                    
                };

                bidderSvc.confirmAdmin = function(id) {
                    var deferred = $q.defer();

                    Restangular.all('bidder').one(id).
                            customPOST({}, 'confirmadmin').then(function(res) {
                        deferred.resolve(res.originalResponse);
                    }, function(res) {
                        deferred.reject(res);
                    });

                    return deferred.promise;
                };


                bidderSvc.getCvCtrl = function(userId){
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        },
                        httpConfig = {
                            url: '/bidders/cv.json/' + userId,
                            method: 'GET'
                        };

                        $http(httpConfig)
                            .then(successFn, errorFn);

                        return deferred.promise;
                };

                bidderSvc.saveCvInfo = function(userId, cvDescription) {
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        },
                        httpObj = {
                            url: '/api/bidder/' + userId + '/cv',
                            method: 'POST',
                            data: {
                                cvDescription: cvDescription
                            }
                        };

                    $http(httpObj)
                        .then(successFn, errorFn);

                    return deferred.promise;
                };

                bidderSvc.saveFile = function(userId, fileId, model) {
                    var req = angular.copy(model),
                        deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        },
                        httpObj = {
                            method: 'POST',
                            url: '/api/bidder/cv/' + userId + '/' + fileId,
                            data: model
                        };

                    $http(httpObj)
                        .then(successFn, errorFn);

                    return deferred.promise;
                };
                
                bidderSvc.findCtrl = function(model) {
                    return $http.get('/bidders/list.json');
                };
                
                bidderSvc.viewCtrl = function(id) {
                    return $http.get('/bidders/view.json/' + id);
                };
                
                bidderSvc.getCard = function(id) {
                    var deferred = $q.defer(),
                        successFn = function(res) {

                        },
                        errorFn = function(res) {

                        };
                    $http({
                        method: 'GET',
                        url: '/bidder/card.json/' + id
                    })
                    .then(successFn, errorFn);
                    return deferred.promise;
                };
                
                bidderSvc.register = function(){
                    
                };

                /**
                 * Get a user card
                 * 
                 * @param {type} userId
                 * @returns {undefined}
                 */
                bidderSvc.getUserCard = function(userId) {
                    var deferred = $q.defer();

                    Restangular.all('bidder').one(userId).customGET({}, 'card').then(function(res) {
                        var response = {
                            name: res.displayName,
                            uri: res.uri
                        };
                        deferred.resolve(response);
                    }, function(res) {
                        deferred.reject(res);
                    });

                    return deferred.promise;
                };
                
                bidderSvc.getCvFile = function() {
                    
                };
                
                bidderSvc.getMyCategoriesCtrl = function(id){
                    var url = '/bidder/my-categories.json';
                    if(!_.isUndefined(id)) {
                        url = url + '?id=' + id;
                    }
                    return $http.get(url);
                };
                
                bidderSvc.addCategory = function(categoryId, userId) {
                    var model = {categories: [categoryId]},
                        url = '/api/bidder/category';

                    if(!_.isUndefined(userId) && !_.isNull(userId)) {
                        url = url + '?id=' + userId;
                    }
                    return $http.post(url, model);
                };
                
                bidderSvc.delCategory = function(id, userId) {
                    var url = '/api/bidder/category/' + id;
                    if(!_.isUndefined(userId)) {
                        url = url + '?id=' + userId;
                    }
                    return $http({
                        method: 'DELETE',
                        url: url
                    });
                };

                bidderSvc.getRankboardCtrl = function(id){
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        };

                    $http({
                        method: 'GET',
                        url: '/bidders/rank.json'
                    })
                        .then(successFn, errorFn);
                    return deferred.promise;
                };

                bidderSvc.getRankboard = function(){
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        },
                        httpConfig = {
                            method: 'GET',
                            url: '/api/bidder/rank'
                        };

                    $http(httpConfig)
                        .then(successFn, errorFn);

                    return deferred.promise;
                };

                bidderSvc.setReputation = function(userId, reputation) {
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        },
                        model = {
                            reputation: reputation
                        },
                        httpObj = {
                            method: 'POST',
                            url: '/api/bidder/reputation/' + userId,
                            data: model
                        };

                    $http(httpObj)
                        .then(successFn, errorFn);

                    return deferred.promise;
                };

                bidderSvc.findRank = function(model) {
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        };

                    $http({
                        method: 'GET',
                        url: '/bidders/rank.json',
                        params: model
                    })
                    .then(successFn, errorFn);

                    return deferred.promise;
                };

                bidderSvc.getRank = function(id) {
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        };

                    $http({
                        method: 'GET',
                        url: '/api/bidder/' + id + '/rank'
                    })
                        .then(successFn, errorFn);

                    return deferred.promise;
                };


               /**
                bidderSvc.setDiscount =function (projectId, discount) {
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        },
                        request = {
                            projetId: projectId,
                            discountId: discount
                        },
                        httpObj = {
                            url: '/api/bid/discount',
                            method: 'POST',
                            data: request
                        };

                    $http(httpObj)
                        .then(successFn, errorFn);

                    return deferred.promise;
                };*/


                return bidderSvc;
            }]);
(function(){
	var svc = function($rootScope, bidderSvc, contractorSvc, adminSvc, ACCOUNT_STATE, AUCTION_STATE){
		this.init = function(model){
			$rootScope.ACCOUNT_STATE = ACCOUNT_STATE;
	        $rootScope.AUCTION_STATE = AUCTION_STATE;

            $rootScope.isAuthenticated = true;

			$rootScope.showLoginForm = false;
            $rootScope.userId = model.userId;
            var userDash = {
                displayName: model.userDisplayName,
                id: model.userId,
                uri: model.userUri,
                avatar: model.userAvatar,
                profileType: model.profileType,
                profileDisplay: model.profileDisplay
            }, userRank;
            $rootScope.userDash = userDash;
            $rootScope.isAdmin = model.profileType === 99;
            $rootScope.isBidder = model.profileType === 1;
            $rootScope.isContractor = model.profileType === 2;

            var now = new Date();
            var start = new Date(now.getTime() + 1*60000);
            var end = new Date(now.getTime() + 2*60000);
     
            switch (model.profileType) {
                case 1:
                    bidderSvc.init(model);
                    break;
                case 2:
                    contractorSvc.init(model);
                    break;
                case 99:
                    adminSvc.init(model);
                    break;
            }

            var modelRes = {
                userId: model.userId,
                userRank: userRank,
                userDash: userDash,
                profile: model.profileType,
                model: model
            };

            return modelRes;
		};
	};

	angular
		.module('fifi')
		.service('bootService', ['$rootScope', 'bidderSvc', 'contractorSvc', 'adminSvc', 'ACCOUNT_STATE', 'AUCTION_STATE', svc])
})();
angular.module('fifi').
    /*
     * While the auctionFollow allows one user to follow several auctions
     * This service handles the contractor data, containing the projects and auctions he own
     * Data from this service may be repetead in followSvc
     */
        service('contractorSvc', ['$rootScope', 'auctionFollowSvc', '$q', '$http',
            function($rootScope, auctionFollowSvc, $q, $http) {

                var data = {
                    projects: [],
                    auctions: []
                };

                var init = function(model) {
                    $rootScope.userRank = {
                        profile: 2,
                        auctionsPublished: 0,
                        totalEarnings: 0,
                        rankPosition: 3,
                        rankLevel: 0,
                        rankPercentage: 90
                    };
                    $rootScope.isContractor = true;
                    auctionFollowSvc.setProjects(model.projectsActive);
                    this

                };

                var ownProject = function(id) {

                };

                var ownAuction = function(id) {

                };

                var incrementCashFn = function(userId, amount){
                    var deferred  =$q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        },
                        request = {
                            amount: amount
                        };

                    $http({
                            method: 'POST',
                            url: '/api/contractor/cash',
                            params: {id: userId},
                            data: request
                        })
                        .then(successFn, errorFn);

                    return deferred.promise;
                };

                var getCashFn = function(userId) {
                    var deferred = $q.defer(),
                        successFn = function(res) {
                            deferred.resolve(res.data);
                        },
                        errorFn = function(res) {
                            deferred.reject(res);
                        };
                   $http({
                       method: 'GET',
                       url: '/api/contractor/cash',
                       params: {
                           id: userId
                       }
                   })
                       .then(successFn, errorFn);
                    return deferred.promise;
                };

                return {
                    init: init,
                    getCash: getCashFn,
                    incrementCash: incrementCashFn,
                    ownProject: ownProject,
                    ownAuction: ownAuction,
                    getProjectsId: function(){
                        return data.projects;
                    },
                    getAuctionsId: function(){
                        return data.auctions;
                    }
                };

            }]).
factory('contractorData', ['$rootScope', '$q', function($rootScope, $q) {

    }]);
/*(function(){
    var svcFn = function($http, userSvc, $q) {
        this.postCash = function(id, amount){
            var deferred = $q.defer(),
                successFn = function(res) {
                    return deferred.resolve(res.data);
                },
                errorFn = function(res) {
                    return deferred.reject(res);
                };

            $http
                .post('/api/contrator/' + id + '/cash', {amount: amount})
                .then(successFn, errorFn);

            return deferred.promise;
        };

        this.getCash = function(id){
            var deferred = $q.defer(),
                successFn = function(res) {
                    return deferred.resolve(res.data);
                },
                errorFn = function(res) {
                    return deferred.reject(res);
                };

            $http
                .get('/api/contractor/' + id + '/cash')
                .then(successFn, errorFn);

            return deferred.promise;
        };
    };
     angular
         .module('fifi')
         .service('contractorSvc', ['$http', 'userSvc', '$q'. svcFn]);
})();*/
angular.module('fifi').
        service('fifiAccountSvc', ['$q', 'Restangular', '$http',
            function($q, Restangular, $http) {

                /*
                 * Helper append the forms dtos to a unique request dto
                 * Each property is pre fixed by his form dto name.
                 * Ie: form.billing.name turns to billingName
                 */
                var appendDto = function(request, dto, name) {
                    angular.forEach(dto, function(value, key) {
                        request[name + _(key).capitalize()] = value;
                    });
                };

                return {
                    getCvFiles: function(id) {
                        var req = {},
                            deferred = $q.defer();

                        if(_.isUndefined(id)) {
                            req.id = id;
                        }

                        $http({method: 'GET', url: '/api/bidder/cv', params: req}).
                                success(function(data) {
                                    deferred.resolve(data);
                                }, function(data) {
                                    deferred.reject(data);
                                });
                        return deferred.promise;
                    },
                    removeCvFile: function(id, userId) {
                        var deferred = $q.defer();
                          var url = '/api/bidder/cv';
                            if(!_.isUndefined(userId)) {
                                url = url + '/' + userId;
                            }

                        $http({method: 'DELETE', url: url, data: {fileId: id}}).
                                success(function(data) {
                                    deferred.resolve(data);
                                }).error(function(res) {
                            deferred.reject(res);
                        });

                        return deferred.promise;
                    },
                    getCvFilesWithToken: function(userId, token) {
                        var deferred = $q.defer(),
                            successFn = function(res) {
                                deferred.resolve(res.data);
                            },
                            errorFn = function(res) {
                                deferred.reject(res);
                            },
                            httpConfig = {
                                method: 'GET',
                                url: '/api/bidder/cv/' + userId + '/' + token
                            };

                        $http(httpConfig)
                            .then(successFn, errorFn);
                        return deferred.promise;
                    },
                    removeCvFileWithToken: function(userId, fileId, token) {
                        var deferred = $q.defer();

                        $http({method: 'DELETE', url: '/api/bidder/cv/' + userId + '/' + token, data: {fileId: fileId}}).
                                success(function(data) {
                                    deferred.resolve(data);
                                }).
                                error(function(data) {
                                    deferred.reject(data);
                                });

                        return deferred.promise;
                    },
                    registerBidder: function(id, token, categories, contactDto, billingDto, addressDto, cvDescription, useCompany) {
                        var req = {
                        };
                        appendDto(req, contactDto, 'contact');
                        appendDto(req, billingDto, 'billing');
                        appendDto(req, addressDto, 'address');



                        req['id'] = id;
                        req['token'] = token;
                        req['categories'] = categories || [];
                        req['cvDescription'] = cvDescription;
                        req['useCompany'] = useCompany;
                        var deferred = $q.defer();
                        Restangular.one('bidder').
                                customPOST(req, 'confirm').
                                then(function(res) {
                                    deferred.resolve(res.originalResponse)
                                }, function(res) {
                                    deferred.reject(res);
                                });
                        /*
                         var _data = angular.copy(req);
                         _data.file = file;
                         
                         
                         $http({
                         method: 'POST',
                         url: '/api/bidder/confirm',
                         headers: {'Content-Type': false},
                         transformRequest: function(data) {
                         var formData = new FormData();
                         angular.forEach(req, function(key, value) {
                         if (key !== 'file') {
                         formData.append(key, angular.toJson(value));
                         }
                         });
                         formData.append('file', file);
                         return formData;
                         },
                         data: _data
                         }).
                         success(function(data, status, headers, config) {
                         deferred.resolve(data);
                         }).
                         error(function(data, status, headers, config) {
                         deferred.reject(data);
                         });
                         */

                        return deferred.promise;
                    },
                    registerContractor: function(id, token, contactDto, billingDto,  addressDto, useCompany) {
                        var req = {
                            useCompany: useCompany
                        };
                        appendDto(req, contactDto, 'contact');
                        appendDto(req, billingDto, 'billing');
                        appendDto(req, addressDto, 'address');


                        req['id'] = id;
                        req['token'] = token;
                        var deferred = $q.defer();
                        Restangular.one('contractor').
                                customPOST(req, 'confirm').
                                then(function(res) {
                                    deferred.resolve(res.originalResponse)
                                }, function(res) {
                                    deferred.reject(res);
                                });

                        return deferred.promise;
                    }
                };
            }]);
(function(){
    /**
     * @ngdoc overview
     *
     * @description
     * The follow services stores the auctions and projects that the user is following
     * Those auctions don't have to be active
     * It handles the websocket connections with Pusher
     * Brodcast new bids through 'bid'
     *
     * @todo
     *  * abstract the websocket connections, once for all!
     */

    /**
     * @ngdoc factory
     * @name jobsApp.auctionFollowSvc
     */
    var svcFn = function($pusher, jobSvc, $q, modalSvc, $rootScope, $log, fifiConfig, AUCTION_FOLLOW_STATE, $timeout, $modal, projectSvc, biddyConfiguration) {
        /*
         * I keep the auctions and projects in this project
         * Use getProjects and getAuctions to return a reference of this
         * Changes are propagated through $.apply. The event is fired by the websockets, so it's needed
         */
        var svc = {};

        svc.wsEnabled = false;

        /*
         * Following auctions
         */
        svc.auctions = [];
        /*
         * Following projects
         */
        svc.projects = [];
        /*
         * Id of project that's in user screen
         * When the user is not viewing a project, it's null */
        svc.currentProjectView = null;

        var pusher = null,
            client = null;

        /**
         * @name bidProject
         * @eventType brodcast
         *
         * @description
         * Send a new bid
         * This function update the project and auction state, as well propagate the changes to others components with $brodcast
         * Others components will listen to 'bid' event
         */
        

        /**
         * Enable the Realtime updates through websockets
         * @param registerHandlers bool if true, will bind to pusher channels
         */
        var enableWs = function(registerHandlers){
            svc.wsEnabled = true;
            Pusher.log = function(message) {
                $log.debug(message);
            };

            client = new Pusher(biddyConfiguration.appKey);
            /*
            {
                wsHost: biddyConfiguration.wsHost,
                wsPort: biddyConfiguration.port,
                wssPort: "8080",
                enabledTransports: ['ws', 'flash']
            }
            */

            pusher = $pusher(client);
            $log.debug('created the pusher client');

            if(registerHandlers) { // check project stat
                angular.forEach(svc.projects, function(value, key) {
                    registerBidHandler(value.id);
                })
            }
            $log.debug('Websockets enabled');
        };  

        var disableWs = function(){

        };
        /**
         * @link ng.$rootScope.Scope#methods_$on listen
         * Callback for a new bid
         * Receive a event from websockets
         */
        $rootScope.$on('bid', function(event, res) {
            $log.debug('bid event received');
            var ab = false,
                projectIndex = null,
                auctionIndex = null;

            angular.forEach(svc.projects, function(item, key) {
                if (ab) {
                    return false;
                }
                angular.forEach(item.jobs, function(aitem, akey) {
                    if (aitem.id === res.auctionId) {
                        if(_.isUndefined(svc.projects[key].jobs[akey].bids)) {
                            svc.projects[key].jobs[akey].bids = [];
                        }
                        svc.projects[key].jobs[akey].bids.push({
                            userId: res.userId,
                            amount: res.ammount
                        });
                        svc.projects[key].jobs[akey].bidsCount = parseInt(svc.projects[key].jobs[akey].bidsCount) + 1;

                        svc.projects[key].jobs[akey].lastBidUserId = res.userId;
                        svc.projects[key].jobs[akey].lastBidAmount = res.ammount;
                        if (res.userId !== $rootScope.userId && !isCurrentView(svc.projects[key].jobs[akey].id)) {
                            svc.projects[key].jobs[akey].newBid = true;
                        }
                        else if (res.userId === $rootScope.userId) {
                            svc.projects[key].jobs[akey].userBid = res.ammount;
                        }
                        svc.projects[key].jobs[akey].bidState = res.userId === $rootScope.userId
                            ? AUCTION_FOLLOW_STATE.winning
                            : AUCTION_FOLLOW_STATE.loosing;

                        $log.info('$rootScope.$apply by auctionFollowSvc');

                        projectIndex = key;
                        angular.forEach(svc.auctions, function(ai, ak) {
                            if(ai.id === res.auctionId) {
                                auctionIndex = ak;
                                ab = true;
                                return false;
                            }
                        });
                    }
                });
            });

            if (false) { // Auction exists and the user isn't viewing the main project page
                $rootScope.$apply(function() {
                    svc.auctions[auctionIndex].lastBidUserId = res.userId;
                    svc.auctions[auctionIndex].lastBidAmount = res.ammount;
                    if (res.userId !== $rootScope.userId && !isCurrentView(svc.auctions[projectIndex].id)) {
                        svc.projects[projectIndex].newBid = true;
                        svc.auctions[auctionIndex].newBid = true;
                    }
                    else if (res.userId === $rootScope.userId) {
                        svc.auctions[auctionIndex].userBid = res.ammount;
                    }
                    svc.auctions[auctionIndex].bidState = res.userId === $rootScope.userId
                        ? AUCTION_FOLLOW_STATE.winning
                        : AUCTION_FOLLOW_STATE.loosing;

                    $log.info('$rootScope.$apply by auctionFollowSvc');
                    return false;
                });
            }
        });
        
        /**
         * @name Register Bid Handler
         *
         * @description
         * Binds the pusher handler for a new incoming bid
         */
        var registerBidHandler = function(projectId) {
            var channel = 'p' + projectId;
            var wsChannel = pusher.subscribe(channel);
            $log.debug('Subscribed ' + channel + ' channel');
            wsChannel.bind('bid', function(res) {
                $log.info('new bid incoming');
                angular.forEach(svc.projects, function(obj, indexProject) {
                    if (obj.id === res.projectId) {
                        angular.forEach(obj.jobs, function(objAuction, indexAuction) {
                            if (objAuction.id === res.auctionId) {
                                $log.info('starting brodcast');
                                /**
                                 * Broadcast to all listeners (directives, services, etc) */
                                $rootScope.$broadcast('bid', res);
                            }
                        });
                    }
                });
            });
            $log.debug('Registered bid handler for project ' + projectId);
        };


        var isCurrentView = function(id) {
            return !_.isNull(svc.currentProjectView) && svc.currentProjectView === id;
        };

        var removeAuctions = function(ids) {
            if (!_.isArray(ids)) {
                return false;
            }
            var p = 0; // track total pulled auctions to compare with array length
            angular.forEach(svc.auctions, function(value, key) {
                if (!_.isUndefined(value) && _.contains(ids, value.id)) {
                    p++;
                    this.splice(key, 1);
                    if (p === ids.length) {
                        return false;
                    }
                }
            }, svc.auctions);
        };

        var addAuction = function(dto) {
            dto.busy = false;
            svc.auctions.push(dto);
            $rootScope.userRank.auctionsDone = $rootScope.userRank.auctionsDone++;
        };

        var removeProject = function(id) {
            angular.forEach(svc.projects, function(value, key) {
                if (!_.isUndefined(value) && value.id === id) { // i don't know why but this foreach is looping more one than length, and value gets undefined
                    this.splice(key, 1);
                    return false;
                }
            }, svc.projects);
        };

        var endModal = function(id){

            angular.forEach(svc.projects, function(value, key) {

                if(value['id'] == id) {
                    value['state'] = 7;
                    value['stateDisplay'] = 'Revisão Pendente';

                    angular.forEach(value['jobs'], function(jValue, jKey) {
                        jValue['state'] = 7;
                        jValue['stateDisplay'] = 'Revisão Pendente';
                    });
                }
            });
            $modal.open({
                templateUrl: '/volupio-biddy/project/end.html',
                resolve: {
                    projectId: function(){
                        return id;
                    }
                },
                controller: ['$scope', 'projectId', '$modalInstance', 'projectSvc', function($scope, projectId, $modalInstance, projectSvc) {

                    projectSvc.get(projectId)
                        .then(function(dto) {
                            $scope.project = dto;
                        });

                    $scope.close = function(){
                        $modalInstance.close();
                    };
                }]
            });
        };

        var startModal = function(id) {
            
            var a = false; // aux to detect if any project is activated
            angular.forEach(svc.projects, function(value, key) {
                
                if(value['id'] == id) {
                    value['state'] = 3;
                    value['stateDisplay'] = 'Activo';
                    a = true;

                    angular.forEach(value['jobs'], function(jValue, jKey) {
                        jValue['state'] = 3;
                        jValue['stateDisplay'] = 'Activo';
                    });
                }
            });

            if(a && svc.wsEnabled != true) {
                enableWs();
            }

            $modal.open({
                templateUrl: '/volupio-biddy/project/start.html',
                resolve: {
                    projectId: function(){
                        return id;
                    }
                },
                controller: ['$scope', 'projectId', '$modalInstance', 'projectSvc', function($scope, projectId, $modalInstance, projectSvc) {

                    projectSvc.get(projectId)
                        .then(function(dto) {
                            $scope.project = dto;
                        });

                    $scope.close = function(){
                        $modalInstance.close();
                    };
                }]
            });
        };

        var registerEndHandler = function(projectId, endDate) {
            $log.debug('register end for ' + projectId + ' project at ' + endDate);
            var now = Date.now(),
                dif = endDate - now,
                diffSeconds = dif - 1000;


            $timeout(function(){
                endModal(projectId);
            }, diffSeconds);
        };

        var registerStartHandler = function(projectId, startDate) {
            $log.debug('register start for ' + projectId + ' project at ' + startDate);
            var now = Date.now(),
                diff = startDate - now,
                diffSeconds = diff - 1000;

            $timeout(function(){
                startModal(projectId);
            }, diffSeconds);
        };

        var endBidderProject =  function(id){
            var deferred = $q.defer();
            projectSvc.unjoin(id).then(function(res) {
                removeProject(id);
                //  this.removeAuctions(res.data.auctionIds);
                //modalSvc.display(res)
                deferred.resolve(res);

            }, function(res) {
                deferred.reject(res);
            });
            return deferred.promise;

        };

        var setProjects = function(p) {
            angular.forEach(p, addProject);
        };

        var addProject = function(projectDto) {
            var dto = angular.copy(projectDto);
            processProject(dto);
            svc.projects.push(dto);

        };

        var anyProjectActive = function(){
            var any = false;
            angular.forEach(svc.projects, function(value, key) {
                if(value.state === 3) {
                    any = true;
                }
                if(any)
                    return;
            });

            return any;
        }

        var processProject = function(project) {
            if(project.state === 2 || project.state === 3) {

                var now = Date.now(),
                    startDate = moment(project.start),
                    endDate = moment(project.end),
                    start = startDate.toDate() - now,
                    startSeconds = start - 1000,
                    end = endDate.toDate() - now,
                    endSeconds = end - 1000;

                if(startSeconds> 0) {
                    registerStartHandler(project.id, startDate.toDate());
                }
                if(endSeconds > 0) {
                    registerEndHandler(project.id, endDate.toDate());
                }
            }

            transformProject(project);

            if(svc.wsEnabled) {
                registerBidHandler(project.id);
            }
        };

        var transformProject = function(dto) {
            dto.newBid = false;
            if(!_.isUndefined(dto['start']['date'])) {
                dto.startDisplay = moment(dto.start).format("HH:mm:ss");
            }
            if(!_.isUndefined(dto['end']['date'])) {
                dto.endDisplay = moment(dto.end).format("HH:mm:ss");
            }
        };




        return {
            /*
             * If the auction has the new bid state, clears it
             */
            readProject: function(id) {
                angular.forEach(svc.auctions, function(value, key) {
                    if (value.projectId === id && value.newBid === true) {
                        svc.auctions[key].newBid = false;
                    }
                });

            },
            projects: svc.projects,
            getAuctions: function() {
                return svc.auctions;
            },
            getProjects: function() {
                return svc.projects;
            },
            addProject: addProject,
            addAuction: function(auctionDto) {
                return addAuction(auctionDto);
            },
            addAuctions: function(auctions) {
                angular.forEach(auctions, function(value, key) {
                    addAuction(value);
                });
            },
            endBidderProject: endBidderProject,
            removeProject: function(id) {
                return removeProject(id);
            },
            setProjects: setProjects,
            setAuctions: function(l) {
                // Subscribe to ws channels
                angular.forEach(l, function(obj) {
                    var auction = angular.copy(obj);
                    auction.newBid = false;
                    auction.bidState = AUCTION_FOLLOW_STATE.pristine;
                    this.push(obj);

                }, svc.auctions);
            },
            removeAuctions: function(ids) {
                var res =  removeAuctions(ids);
                $rootScope.userRank.auctionsDone = $rootScope.userRank.auctionsDone - ids.length;
                return res;
            },
            add: function(auctionId) {
                jobSvc.get(auctionId).then(function(res) {

                }, function(res) {

                });
            },
            /**
             * Remove the watchin on a auction, not the auction itself
             *
             * @param {type} auctionId
             * @returns {undefined}
             */
            unfollowAuction: function(auctionId) {
                jobSvc.removeFollowing($rootScope.userId, auctionId).then(function(res) {
                    removeAuctions([auctionId]);
                });
            },
            bid: function(auctionId, ammount) {

            },
            setCurrentView: function(id) {
                $log.info('current project view: ' + id);
                svc.currentProjectView = id;

                /*
                 * Clear new bids flags for project and his auctions */
                angular.forEach(svc.projects, function(project, key) {
                    if (project.id === id) {
                        svc.projects[key].newBid = false;
                        $log.info('project ' + id + ' new bid set to false');
                    }
                });
                angular.forEach(svc.auctions, function(auction, key) {
                    $log.info(JSON.stringify(auction));
                    if (auction.groupId === id) {
                        svc.auctions[key].newBid = false;
                        $log.info('auction ' + auction.id + ' newbid set to false');
                    }
                });
            },
            /**
             * Remove the current view
             *
             * @returns {undefined}
             */
            exitCurrentView: function() {
                $log.info('exit current view');
                svc.currentProjectView = null;
            },
            /**
             * Indicates if the user is currently viewing this project
             * @param {type} id
             * @returns {unresolved}
             */
            isCurrentView: function(id) {
                return isCurrentView(id);
            },
            /**
             * Indicates if a project is already being followed by the user
             * @param {string} id project id
             */
            isFollowing: function(id) {
                var f = false; // flag aux
                angular.forEach(svc.projects, function(value, key) {
                    if (value.id === id) {
                        f = true;
                        return false;
                    }
                });
                return f;
            },
            isFollowingAuction: function(id) {
                var f = false;
                angular.forEach(svc.auctions, function(value, key) {
                    if (value.id === id) {
                        f = true;
                        return false;
                    }
                });
                return f;
            },
            enableWs: function(){
                enableWs();
            },
            anyProjectActive: anyProjectActive,
            enableWsIfActive: function(){
                if(svc.projects.length == 0 || !anyProjectActive())
                    return;

                enableWs(true);
            },
            disableWs: function(){
                disableWs();
            }
        };
    };
    angular
        .module('fifi')
        .factory('auctionFollowSvc', ['$pusher', 'jobSvc', '$q', 'modalSvc', '$rootScope', '$log', 'fifiConfig', 'AUCTION_FOLLOW_STATE', '$timeout', '$modal', 'projectSvc', 'biddyConfiguration', svcFn]);
})();
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

angular.module('fifi').
        factory('jobCategorySvc', ['$q', 'Restangular', 'modalSvc', function($q, Restangular, modalSvc) {
        var jobCategorySvc = {};

        jobCategorySvc.find = function(skip, take, childs, model) {

            var defer = $q.defer();
            var req = _.isUndefined(model) ? {} : model;
            req.skip = skip;
            req.take = take;
                    
            if(!_.isUndefined(childs)) {
                req.childs = childs;
            }
            Restangular.all('category').customGET('', req).then(function(res) {
                defer.resolve(res.originalResponse);
            }, function(res) {
                defer.reject(res);
            });
            return defer.promise;
        };

        jobCategorySvc.get = function(categoryId) {
            var defer = $q.defer();
            Restangular.all('category').one(categoryId).customGET('', {}).then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });

            return defer.promise;
        };

        jobCategorySvc.create = function(name, content) {
            var defer = $q.defer(),
                    request = {
                        name: name,
                        content: content
                    };

            Restangular.all('category').customPOST(request, '').then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });

            return defer.promise;
        };

        jobCategorySvc.createWithParent = function(parentId, name, content) {
            var defer = $q.defer(),
                    request = {
                        name: name,
                        content: content,
                        parentId: parentId
                    };

            Restangular.all('auction').all('category').customPOST(request, '').then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });

            return defer.promise;
        };

        jobCategorySvc.uploadThumbnail = function(categoryId) {
            var deferred = $q.defer();
            
            
            
            return deferred.promise;
        };
        
        jobCategorySvc.getInfo = function(categoryId){
            var deferred = $q.defer();
            
            Restangular.all('category').one(categoryId).customGET('info', '').then(function(res) {
                var model = {
                    name: res.name,
                    content: res.content
                };
                deferred.resolve(model);
            }, function(res) {
                deferred.reject(res);
            });
            
            return deferred.promise;
        };
        
        jobCategorySvc.saveInfo = function(categoryId, name, content) {
          var deferred = $q.defer(),
              req = {
                  name: name,
                  content: content
              };
          Restangular.all('category').one(categoryId).customPOST(req, 'info').then(function(res) {
              deferred.resolve(res);
          }, function(res) {
              deferred.res(res);
          });
          
          return deferred.promise;
        };
        
        /**
         * Remove a category
         * 
         * API: /api/auction/category/:id'
         * 
         * @param {type} categoryId
         * @returns {undefined}
         */
        jobCategorySvc.remove = function(categoryId) {
           var deferred = $q.defer();
           
           Restangular.all('auction').all('category').one(categoryId).remove().then(function(res) {
               deferred.resolve(res);
           }, function(res) {
               deferred.reject(res);
           });
            
           return deferred.promise;
        };

        return jobCategorySvc;
    }]);
function postJobReq() {
    this.name = '';
    this.content = '';
    this.minBudget = null;
    this.maxBudget = null;
    this.begin = null;
    this.end = null;
    this.categories = [];
}
/**
 * Job Service
 * 
 */
angular
    .module("fifi")
    .service('jobSvc', ['$http', '$q', 'Restangular', 'modalSvc', function($http, $q, Restangular, modalSvc) {

        
        var jobSvc = {};
        jobSvc.getAuction = function(id) {
            var defer = $q.defer();

            var job = Restangular.one('auction', id)
                    .get();
            defer.resolve(job);

            return defer.promise;
        };

        /**
         * return a job 
         * 
         * Return a job dy id
         * @param {string} id
         * @returns job dto
         */
        jobSvc.getById = function(id) {
            var deferred = $q.defer();
                var job = Restangular.one('jobs', id)
                        .get();
                deferred.resolve(job);
                /*$http.get('/api/jobs/' + id).success(function(res) {
                 deferred.resolve(res);
                 });*/
            return deferred.promise;
        };
        /**
         * return jobs
         * 
         * Get a list of jobs filtered
         * @returns array
         */
        jobSvc.getAll = function(queries) {
            var defer = $q.defer();
                Restangular.all('jobs').customGET('', queries)
                        .then(function(res) {
                            // Save results in cache
                            /*for(var i = 0; i < res.length; i++) {
                             jobCache.put(res[i].id, res[i]);
                             }*/
                            defer.resolve(res);
                        });
            return defer.promise;
        };
        jobSvc.getAuctionsByOwner = function() {
            var defer = $q.defer();
            Restangular.all('me/jobs').getList()
                    .then(function(res) {
                        defer.resolve(res);
                    }, function(res) {
                        defer.reject(res);
                    });
            return defer.promise;
        };
        jobSvc.getGroupsByOwner = function() {
            var defer = $q.defer();
            Restangular.all('me/groups').getList()
                    .then(function(res) {
                        defer.resolve(res);
                    }, function(res) {
                        defer.reject(res);
                    })
            return defer.promise;
        };


        /**
         * @ngdoc method
         * @name Create a auction for a group
         * 
         * @description
         * 
         * API: /api/group/:id/auction
         * 
         * @param {type} groupId
         * @param {type} model
         * @returns {$q@call;defer.promise}
         */
        jobSvc.createAuctionToGroup = function(groupId, model) {
            var deferred = $q.defer(),
                    req = angular.copy(model);

            Restangular.all('group').one(groupId).customPOST(req, 'auction').then(function(res) {
                deferred.resolve(res);
            }, function(res) {
                deferred.reject(res);
            });

            return deferred.promise;
        }

        jobSvc.createAuctionForGroup = function(groupId, name, content, begin, end, minBudget, maxBudget, payment) {
            var defer = $q.defer();

            var req = {
                groupId: groupId,
                name: name,
                content: content,
                begin: begin,
                end: end,
                minBudget: minBudget,
                maxBudget: maxBudget,
                payment: payment
            };

            Restangular.all('jobs').post(req).then(function(res) {
                // jobCache.put(res.id, res);
                defer.resolve(res);
            });

            return defer.promise;
        }

        /**
         * @ngdoc method
         * @name save info
         * 
         * @description
         * Save basic information
         * 
         * @param object dto
         * @returns {unresolved}
         */
        jobSvc.updateAuctionInfo = function(id, name, excerpt, content) {
            var defer = $q.defer(),
                    req = {
                        id: id,
                        name: name,
                        excerpt: excerpt,
                        content: content
                    };

            Restangular.all('jobs').
                    one(req.id).
                    one('info').
                    customPOST(req, '').
                    then(function(res) {
                        defer.resolve(res);
                    }, function(res) {
                        defer.reject(res);
                    });

            return defer.promise;
        };

        /**
         * Update Auction @DECRAPTED
         
         jobSvc.saveAuction = function(id, name, content) {
         var defer = $q.defer();
         var putAuctionReq = {
         name: name,
         content: content
         };
         
         Restangular.oneUrl('jobs/' + id + '/info')
         //.withHttpConfig({ transformRequest: angular.identity })
         .customPOST(putAuctionReq, '').then(function(res) {
         modalSvc.display(res);
         defer.resolve(res);
         }, function(res) {
         modalSvc.display(res);
         defer.reject(res);
         });
         return defer.promise;
         };
         */
        /**
         * Controllers
         */
        jobSvc.auctionEditCtrl = function(id) {
            var defer = $q.defer();

            Restangular.
                    one('auction.json').
                    one(id).
                    one('edit').
                    get().
                    then(function(res) {
                        defer.resolve(res);
                    }, function(res) {
                        defer.reject(res);
                    });

            return defer.promise;
        };
        jobSvc.auctionCreateCtrl = function() {
            var defer = $q.defer();
            Restangular.
                    one('auction.json/create').
                    get().
                    then(function(res) {
                        defer.resolve(res);
                    }, function(res) {
                        defer.reject(res);
                    });
            return defer.promise;
        };

        jobSvc.auctionListCtrl = function() {
            var deferred = $q.defer();

            Restangular.
                    one('auction.json/list').
                    get().
                    then(function(res) {
                        deferred.resolve(res.originalResponse);
                    }, function(res) {
                        deferred.reject(res);
                    });

            return deferred.promise;
        };

        /**
         * @ngdoc function
         * @name auction view controller
         * 
         * @description
         * Get the request model 
         * 
         * @param {type} auctionId
         * @returns {unresolved}
         */
        jobSvc.auctionViewCtrl = function(auctionId) {
            var defer = $q.defer();
            Restangular.one('auction.json/view', auctionId).get().then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });
            return defer.promise;
        }

        /**
         * @ngdoce function
         * @name category create
         *
         * @description
         *
         * Create a new category
         * @param string name
         * @param string description
         * @param object_id|null parentId
         */
        jobSvc.categoryCreate = function(name, description, parentId) {
            var defer = $q.defer(),
                    req = {
                        name: name,
                        description: description,
                        parentId: parentId
                    };

            Restangular.all('category').customPOST(req, '').then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });

            return defer.promise;
        };
        /**
         * @ngdoc function
         * @name category save
         *
         * @description
         * Update category basic information
         */
        jobSvc.categorySave = function(categoryId, name, description) {
            var defer = $q.defer(),
                    req = {
                        name: name,
                        description: description
                    };

            Restangular.all('category').one(categoryId).customPOST(req, '').then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });

            return defer.promise;
        };
        /**
         * @ngdoc function
         * @name category get
         *
         * @description
         * Get a category by id
         */
        jobSvc.categoryGet = function(categoryId) {
            var defer = $q.defer();

            Restangular.all('category').one(categoryId).get().then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            })

            return defer.promise;
        }

        jobSvc.categoryQuery = function(skip, take) {
            var defer = $q.defer();

            Restangular.all('category').getList().then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });

            return defer.promise;
        };

        jobSvc.removeAuction = function(auctionId) {
            var deferred = $q.defer();

            Restangular.all('auction').one(auctionId).remove().then(function(res) {
                deferred.resolve(res);
            }, function(res) {
                deferred.reject(res);
            });

            return deferred.promise;
        };

        jobSvc.bidAuction = function(auctionId, ammount) {
            var deferred = $q.defer();
            var req = {
                ammount: ammount
            };
            Restangular.all('auction').one(auctionId).
                    customPOST(req, 'bid').
                    then(function(res) {
                        deferred.resolve(res.originalResponse);
                    }, function(res) {
                        deferred.reject(res);
                    });
            return deferred.promise;
        };

        jobSvc.getFollowing = function(userId) {
            var deferred = $q.defer();
            Restangular.all('auction').
                    one('like').
                    get().then(function(res) {
                deferred.resolve(res.originalResponse);
            }, function(res) {
                deferred.reject(res);
            });
            return deferred.promise;
        };

        jobSvc.addFollowing = function(userId, auctionId) {
            var deferred = $q.defer(),
                    req = {
                        userId: userId
                    };
            Restangular.all('auction').one(auctionId).
                    customPOST(req, 'like').then(function(res) {
                deferred.resolve(res.originalResponse);
            }, function(res) {
                deferred.reject(res);
            });

            return deferred.promise;
        };

        jobSvc.removeFollowing = function(userId, auctionId) {
            var deferred = $q.defer(),
                    req = {
                        userId: userId
                    };
            Restangular.all('auction').one(auctionId).
                    customDELETE('like', req).then(function(res) {
                deferred.resolve(res.originalResponse);
            }, function(res) {
                deferred.reject(res);
            });
            return deferred.promise;
        };
        
        jobSvc.removeFile = function(auctionId, fileId) {
                        var deferred = $q.defer();
                        $http({
                            method: 'DELETE',
                            url: '/api/auction/' + auctionId + '/file/' + fileId
                        }).success(function(res) {
                            deferred.resolve(res);
                        }).error(function(res) {
                            deferred.reject(res);
                        });
                        
                        return deferred.promise;
                    };

        jobSvc.saveFile = function(auctionId, fileId, model) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/auction/' + auctionId + '/file/' + fileId,
                data: model
            }).success(function(res) {
                deferred.resolve(res.data);
            }).error(function(res) {
                deferred.reject(res);
            });

            return deferred.promise;
        };

        jobSvc.availableCtrl = function(auctionId) {
            return $http.get('/auction.json/' + auctionId +'/accept');
        };
        return jobSvc;
    }]);
(function(){
    var svcFn = function($http, $q, $rootScope) {

        var svc = function(){

        };

        svc.prototype.getController = function(id) {
            if(_.isUndefined(id)) {
                id = $rootScope.userId;
            }

            var deferred = $q.defer(),
                successFn = function(res) {
                    deferred.resolve(res.data);
                },
                errorFn = function(res) {
                    deferred.reject(res);
                },
                httpConfig = {
                    url: '/profile.json',
                    params: { id: id }
                };

            $http(httpConfig)
                .then(successFn, errorFn);

            return deferred.promise;
        };

        return svc;
    };



    angular
        .module('fifi')
        .service('profileSvc', ['$http', '$q', '$rootScope', svcFn]);
})();
angular.module('fifi').
        service('projectApi', ['$http', '$q', function($http, $q) {
                this.getController = function(){
                    return $http.get('/projects.json');
                };
        }]);
(function(){
	
	var svc = function($resource) {
		return $resource('/api/project/:projectId/followers', {});
	};

	svc.$inject = ['$resource'];

	angular
		.module('fifi')
		.factory('projectFollowersSvc', svc);

})();
(function(){
    angular
    .module('fifi')
    .factory('projectListSvc', ['projectSvc', 'modalSvc', '$q', '$rootScope', '$modal', 'projectApi',
    function(projectSvc, modalSvc, $q, $rootScope, $modal, projectApi) {
        var menuCreateIndex;

        var svc = function(){
            var self = this;

            self.busy = false;
            self.results = [];
            self.modelCached = {};
            self.sortBy = 'name';
            self.sortOrder = 'asc';

            self.next = function(){
                self.modelCached.skip = self.results.length;
                return self.get(self.modelCached, false);
            };

            self.setSort = function(sortBy, sortOrder) {

                if(sortBy == self.sortBy) {
                    // reverse the order and keep the sort by
                    self.sortOrder = self.sortOrder == 'asc' ? 'desc' : 'asc';
                }
                else {
                    self.sortBy = sortBy ;
                    self.sortOrder = sortOrder;
                }

                return self.get(self.modelCached, true);
            };

            self.get = function(model, reset) {

                if(self.busy && !reset) return;
                self.busy = true;
                if(_.isUndefined(model)) 
                    model = {};

                model.sortBy = self.sortBy;
                model.sortOrder = self.sortOrder;

                var deferred = $q.defer(),
                    req = angular.copy(model) || {};

                if ($rootScope.isContractor && req.getMy == true) {
                    req.userId = $rootScope.userId;
                }
                if (_.isString(name)) {
                    req.name = name;
                }
                var skip = reset ? 0 : self.results.length;

                self.modelCached = req;
                projectSvc.find(skip, 10, req).
                    then(function(res) {

                        if(reset) {
                            self.results = [];
                        }


                        angular.forEach(res.results, function(value, key) {
                            self.results.push(value);
                        });

                        self.busy = false;
                        deferred.resolve(res);
                    }, function(res) {
                        deferred.reject(res);
                    });
                return deferred.promise;
            };
            self.getController = function() {
                var deferred = $q.defer();
                projectApi.getController().then(function(res) {
                    deferred.resolve(res.data);
                }, function(res) {
                    modalSvc.display(res);
                    deferred.reject(res);
                });
                return deferred.promise;
            };
            self.remove = function(id) {
                var deferred = $q.defer();
                projectSvc.remove(id).
                    then(function(res) {
                        modalSvc.display(res);
                        deferred.resolve(res);
                    }, function(res) {
                        modalSvc.display(res);
                        deferred.reject(res);
                    });
                return deferred.promise;
            };

            self.removeModal = function(id) {
                var instance = $modal.open({
                    templateUrl: '/web/project/remove.html',
                    controller: 'projectListRemoveCtrl',
                    resolve: {
                        projectId: function() {
                            return id;
                        }
                    }
                });
                return instance.result.promise;
            };
        };

        return svc;
    }]);
})();
(function(){
	
	var resource = function($resource) {
		return $resource('/api/project/:id/meta');
	};

	resource.$inject =  ['$resource'];

	angular
		.module('fifi')
		.factory('ProjectMetaResource', resource);
})();
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('fifi').
        factory('projectSvc', ['Restangular', '$q', '$http', function(Restangular, $q, $http) {

        return {

            get: function(projectId, retrieveAuctions) {
                var deferred = $q.defer(),
                    successFn = function(res) {
                        deferred.resolve(res.data);
                    },
                    errorFn = function(res) {
                        deferred.reject(res);
                    },
                    httpObj = {
                        url: '/api/project/' + projectId,
                        method: 'GET'
                    };

                    if(!_.isUndefined(retrieveAuctions) && retrieveAuctions) {
                        httpObj.url = httpObj.url + '?auctions=true'
                    }

                    $http(httpObj)
                        .then(successFn, errorFn);

                    return deferred.promise;
            },
        /**
         * @ngdoc method
         * @name Find
         * @description
         * 
         */
        sendDiscount: function(projectId, discount, description) {
            var model = {
                    projectId: projectId,
                    discount: discount,
                    description: description
                },
                deferred = $q.defer(),
                successFn = function(res) {
                    deferred.resolve(res.data);
                },
                errorFn = function(res) {
                    deferred.reject(res);
                },
                httpObj = {
                    url: '/api/project/discount',
                    method: 'POST',
                    data: model
                };

                $http(httpObj)
                    .then(successFn, errorFn);
                    
                return deferred.promise;
        },
        find: function(skip, take, queryModel) {
        var deferred = $q.defer(),
                req = angular.copy(queryModel || {});
                req.skip = skip;
                req.take = take;
                $http({
                method: 'GET',
                        url: '/api/project',
                        params: req
                }).
                success(function(res) {
                deferred.resolve(res);
                }).
                error(function(res) {
                deferred.reject(res);
                });
                return deferred.promise;
        },
                create: function(model) {
                var defer = $q.defer(),
                        //jobCache = $angularCacheFactory.get('jobCache'),
                        req = angular.copy(model);
                        Restangular.
                        all('project').
                        customPOST(req, '').
                        then(function(res) {
                        //jobCache.put(res.id, res);
                        return defer.resolve(res);
                        }, function(res) {
                        return defer.reject(res);
                        });
                        return defer.promise;
                },
                updateInfo: function(projectId, model) {
                var deferred = $q.defer(),
                        req = angular.copy(model);
                        Restangular.
                        all('project').
                        one(projectId).
                        customPOST(req, 'info').
                        then(function(res) {
                        deferred.resolve(res.originalResponse);
                        }, function(res) {
                        deferred.reject(res);
                        });
                        return deferred.promise;
                },
                remove: function(id) {
                return Restangular.all('project').
                        one(id).
                        remove();
                },
                unjoinAuctions: function(ids) {
                var deferred = $q.defer();
                        $http.post('/api/project/' + ids + '/unjoin', {ids: ids}).
                        success(function(res) {
                        deferred.resolve(res);
                        }).
                        error(function(res) {
                        deferred.reject(res);
                        });
                        return deferred.promise;
                },
        /**
         * @name Join
         * 
         * @description Join a active project
         * @param {mongo_id} id
         * @returns promisse
         */
        join: function(id, auctionIds) {
        var defer = $q.defer();
                Restangular.all('project').one(id).
                customPOST({
                ids: auctionIds
                }, 'like').
                then(function(res) {
                defer.resolve(res.originalResponse);
                }, function(res) {
                defer.reject(res);
                });
                return defer.promise;
        },
                unjoin: function(id) {

                    return $http({
                        method: 'DELETE',
                        url: '/api/project/' + id + '/like'
                    });

                },
                /**
                 * @description Get a list of active projects the user is joinded
                 * @returns promisse
                 */
                getJoin: function() {
                var deferred = $q.defer();
                        Restangular.all('project').
                        customGET('like', {}).
                        then(function(res) {
                        deferred.resolve(res);
                        }, function(res) {
                        deferred.reject(res);
                        });
                        return deferred.promise;
                        return deferred.promise;
                },
                /**
                 * @ngdoc function
                 * @name Publish
                 * 
                 * @description
                 * Publish a project and enqueue all auctions
                 * 
                 * @param mongo_id id
                 */
                publish: function(id, start, end){
                var deferred = $q.defer(),
                    request = {
                        start: start,
                        end: end
                    };


                        Restangular.all('project').
                        one(id).
                        customPOST(request, 'publish').
                        then(function(res) {
                        deferred.resolve(res.originalResponse);
                        }, function(res) {
                        deferred.reject(res);
                        });
                        return deferred.promise;
                },
                /**
                 * @ngdoc function
                 * @name Activate
                 * 
                 * @description
                 * Activate a project
                 * @param mongo_id id
                 */
                activate: function(id) {
                var deferred = $q.defer();
                        Restangular.all('project').one(id).
                        customPOST({}, 'activate').
                        then(function(res) {
                        deferred.resolve(res.originalResponse);
                        }, function(res) {
                        deferred.reject(res);
                        });
                        return deferred.promise;
                },
                createController: function() {
                var defer = $q.defer();
                        Restangular.
                        one('project.json/create').
                        get().
                        then(function(res) {
                        defer.resolve(res);
                        }, function(res) {
                        defer.reject(res);
                        });
                        return defer.promise;
                },
                editController: function(projectId) {
                var defer = $q.defer();
                        Restangular.
                        one('project.json').
                        one(projectId).
                        one('edit').
                        get().
                        then(function(res) {
                        defer.resolve(res);
                        }, function(res) {
                        defer.reject(res);
                        });
                        return defer.promise;
                },
                viewController: function(projectId) {
                var defer = $q.defer();
                        Restangular.
                        one('project.json').
                        one(projectId).
                        one('view').
                        get().
                        then(function(res) {
                        defer.resolve(res.originalResponse);
                        }, function(res) {
                        defer.reject(res);
                        });
                        return defer.promise;
                },
            saveFile: function(projectId, fileId, model) {
                var req = angular.copy(model),
                    deferred = $q.defer(),
                    successFn = function(res) {
                        deferred.resolve(res.data);
                    },
                    errorFn = function(res) {
                        deferred.reject(res);
                    },
                    httpObj = {
                        method: 'POST',
                        url: '/api/project/' + projectId + '/file/' + fileId,
                        data: model
                    };

                $http(httpObj)
                    .then(successFn, errorFn);

                return deferred.promise;
            },
                removeFile: function(projectId, fileId) {
                var deferred = $q.defer();
                        $http({
                        method: 'DELETE',
                                url: '/api/project/' + projectId + '/file/' + fileId
                        }).success(function(res) {
                deferred.resolve(res);
                }).error(function(res) {
                deferred.reject(res);
                });
                        return deferred.promise;
                },
                getFiles: function(projectId, skip, take) {
                    return $http.get('/api/project/' + projectId + '/file');
                }
        };
        }]);

/* 
 * This file is part of the Fifi package
 *  (c) Volupio <webmaster@volupio.com>
 * For the full copyright and license information, please view the LICENSE file that was distributed with this source code
 */

angular.module('fifi')
    .service('proposalSvc', ['$http', '$q', 'Restangular', 'modalSvc', function($http, $q, Restangular, modalSvc) {
        var proposalSvc = {};

        proposalSvc.getCreateController = function(auctionId) {
            var defer = $q.defer();
            $http.get('/auction/' + auctionId + '/proposal/create').then(function(res) {
                defer.resolve(res);
            }, function(res) {
                defer.reject(res);
            });

            return defer.promise;
        };

        proposalSvc.create = function(auctionId, ammount) {
            var defer = $q.defer(),
                    req = {
                        auctionId: auctionId,
                        ammount: ammount
                    };
            Restangular.
                    all('auction').
                    one(auctionId).
                    one('proposal').
                    one('create')
                    .customPOST(req, '').
                    then(function(res) {
                        defer.resolve(res);
                    }, function(res) {
                        defer.reject(res);
                    })

            return defer.promise;
        };

        proposalSvc.findByAuction = function(auctionId, skip, take) {
            var defer = $q.defer();

            Restangular.all('auction').one(auctionId).one('proposal').customGET('').then(function(res) {
                defer.resolve(res);
            }, function(res) {

            });

            return defer.promise;
        };

        return proposalSvc;
    }]);
angular.module('fifi').
        directive('fifiRealtime', ['realtimeSvc', '$log', function(realtimeSvc, $log) {
                return {
                    link: function(scope, elem, attrs) {
                        realtimeSvc.onopen(function() {
                            realtimeSvc.call('init', {}).then(function(res) {
                                $log.info('directive success');
                            }, function(res) {
                                $log.info('directive.error');
                            });
                        });
                    }
                }
            }]).
        provider('piConfig', [function(){
                this.wsPortConfig = 8080;
                this.$get = function(){
                    return {
                        wsPort: wsPortConfig
                    };
                };
        }]).
            /** 
             * Handlers
             * */
        factory('realtimeSvc', ['$q', '$log', '$rootScope', '$location', 'piConfigProvider',
            function($q, $log, $rootScope, $location, piConfigProvider) {
                var callbacks = {},
                        handlers = {},
                        currentId = 0,
                        port = piConfigProvider.wsPort,
                        hostname = window.location.hostname,
                        url = $location.protocol() === 'https'
                        ? 'wws://' + hostname
                        : 'ws://' + hostname;

                if (_.isNumber(port)) {
                    url = url + ':' + port;
                }

                    var wsocket = new WebSocket(url);

                    wsocket.onopen = function() {
                        svc.connected = true;
                        if (svc.handlers.onopen) {
                            $rootScope.$apply(function() {
                                svc.handlers.onopen.apply(wsocket);
                            });
                        }
                    };

                    wsocket.onclose = function() {
                        svc.connected = false;
                        // Create a new socket
                        setTimeout(function() {
                            wsocket = create();
                        }, 3000);
                    };

                    wsocket.onerror = function(res) {
                        $log.info('Websocket error detected: ' + JSON.stringify(res));
                    };

                    wsocket.onmessage = function(e) {
                        var res = JSON.parse(e.data);
                        $log.info("Websocket message received: " + res);

                        $rootScope.$apply(callbacks[res.id].cb.resolve(res.result));
                        delete callbacks[res.id];
                    };

                var svc = {
                    handlers: {},
                    connected: false,
                    onopen: function(callback) {
                        this.handlers.onopen = callback;
                    },
                    onclose: function(callback) {
                        this.handlers.onclose = callback;
                    },
                    call: function(action, params) {

                        if (!this.connected) {
                            setTimeout(function() {
                            }, 3000);
                        }
                        var deferred = $q.defer();
                        var request = {
                            "jsonrpc": "2.0",
                            "method": action,
                            "params": params
                        };

                        currentId += 1;
                        request.id = currentId;
                        callbacks[currentId] = {
                            time: new Date(),
                            cb: deferred
                        };

                        wsocket.send(JSON.stringify(request));

                        return deferred.promise;
                    }
                };

                return svc;
            }]);
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
angular.module('fifi').
        factory('userFifiSvc', ['Restangular', '$q', '$http', function(Restangular, $q, $http) {
                return {
                    getEditCtrl: function(id) {
                        var deferred = $q.defer();
                        Restangular.all('user').one(id).one('edit').get().
                                then(function(res) {
                                    deferred.resolve(res);
                                }, function(res) {
                                    deferred.reject(res);
                                });
                        
                        return deferred.promise;
                    },
                    getProfile: function(id) {
                        var deferred = $q.defer();
                        Restangular.all('user').
                                one(id).
                                one('profile').
                                get().
                                then(function(res) {
                                    deferred.resolve(res.originalResponse);
                                }, function(res) {
                                    deferred.reject(res);
                                });
                        return deferred.promise;
                    },
                    getProfileCtrl: function(id){
                        var deferred = $q.defer();
                        
                        Restangular.one('account/profile/assign.json?id=' + id).get().
                                then(function(res) {
                                   deferred.resolve(res.originalResponse); 
                                }, function(res) {
                                    deferred.reject(res);
                                });
                        
                        return deferred.promise;
                    },
                    find: function(model) {
                        var deferred = $q.defer();
                        
                        $http({
                           method: 'GET',
                           url: '/api/v2/user',
                           params: model
                        }).success(function(res) {
                            deferred.resolve(res);
                        }).error(function(res) {
                            deferred.reject(res);
                        });
                        
                        return deferred.promise;
                    }
                };
            }]);
(function(){
    angular
    .module('fifi')
    .factory('userListSvc', ['projectSvc', 'modalSvc', '$q', '$rootScope', '$modal', 'projectApi',
    function(projectSvc, modalSvc, $q, $rootScope, $modal, projectApi) {
        var menuCreateIndex;

        var svc = function(){
            var self = this;

            self.busy = false;
            self.results = [];
            self.modelCached = {};
            self.sortBy = 'name';
            self.sortOrder = 'asc';

            self.next = function(){
                self.modelCached.skip = self.results.length;
                return self.get(self.modelCached, false);
            };

            self.setSort = function(sortBy, sortOrder) {

                if(sortBy == self.sortBy) {
                    // reverse the order and keep the sort by
                    self.sortOrder = self.sortOrder == 'asc' ? 'desc' : 'asc';
                }
                else {
                    self.sortBy = sortBy ;
                    self.sortOrder = sortOrder;
                }

                return self.get(self.modelCached, true);
            };

            self.get = function(model, reset) {

                if(self.busy && !reset) return;
                self.busy = true;
                if(_.isUndefined(model)) 
                    model = {};

                model.sortBy = self.sortBy;
                model.sortOrder = self.sortOrder;

                var deferred = $q.defer(),
                    req = angular.copy(model) || {};

                if ($rootScope.isContractor && req.getMy == true) {
                    req.userId = $rootScope.userId;
                }
                if (_.isString(name)) {
                    req.name = name;
                }
                var skip = reset ? 0 : self.results.length;

                self.modelCached = req;
                projectSvc.find(skip, 10, req).
                    then(function(res) {

                        if(reset) {
                            self.results = [];
                        }


                        angular.forEach(res.results, function(value, key) {
                            self.results.push(value);
                        });

                        self.busy = false;
                        deferred.resolve(res);
                    }, function(res) {
                        deferred.reject(res);
                    });
                return deferred.promise;
            };
            self.getController = function() {
                var deferred = $q.defer();
                projectApi.getController().then(function(res) {
                    deferred.resolve(res.data);
                }, function(res) {
                    modalSvc.display(res);
                    deferred.reject(res);
                });
                return deferred.promise;
            };
            self.remove = function(id) {
                var deferred = $q.defer();
                projectSvc.remove(id).
                    then(function(res) {
                        modalSvc.display(res);
                        deferred.resolve(res);
                    }, function(res) {
                        modalSvc.display(res);
                        deferred.reject(res);
                    });
                return deferred.promise;
            };

            self.removeModal = function(id) {
                var instance = $modal.open({
                    templateUrl: '/web/project/remove.html',
                    controller: 'projectListRemoveCtrl',
                    resolve: {
                        projectId: function() {
                            return id;
                        }
                    }
                });
                return instance.result.promise;
            };
        };

        return svc;
    }]);
})();