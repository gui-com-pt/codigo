(function(){
  angular
    .module('templates', []);

  angular
    .module('codigo', ['templates', 'pi.core', 'pi.core.app', 'pi.core.payment', 'pi.core.chat', 'pi.core.likes', 'pi.core.product']);

  angular
    .module('codigo')
    .run(['$rootScope', 'pi.core.app.eventSvc', function($rootScope, eventSvc){
      eventSvc.find()
        .then(function(res){
          $rootScope.events = res.data.events;
        });
    }]);
})();
