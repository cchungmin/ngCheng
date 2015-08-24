(function() {
  var app = angular.module('app', []);

  app.controller('Ctrl', function($scope) {
    this.setMe = function() {
      console.log('This is the test');
    };
  });

  app.directive('testDirective', function() {
    return {
      controller: 'Ctrl',
      controllerAs: 'ctrl',
      template: 'Test',
      link: function(scope, element, attrs, ctrl) {

      }
    }
  });
})()
