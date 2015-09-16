(function () {

'use strict';

var querySelector = document.querySelector.bind(document);
var ctn = querySelector('.ctn-curtain');

var app = angular.module('app', ['firebase']);

app.controller('MainCtrl', function($scope, $element, firebase, $http) {
  this.data = firebase.getFirebaseData();
  var url = 'https://api.linkedin.com/v1/people/~?format=json';
  var http = $http;
  var profile = undefined;

  http.get(url).then(
    function (res) {
      console.log(res);
      profile = res;
    },
    function (res){
      console.error(res);
  });

  console.log('mainCtrl', profile);

  this.getProfileData = function() {
    return profile;
  };
});

app.controller('StickyCtrl', function($scope, $element, $window, firebase) {
  var scope = $scope;
  var element = $element;
  var doc = document.documentElement;
  var body = document.body;
  var targetOffset = document.querySelector('.profile').offsetTop;
  this.data = firebase.getFirebaseData();

  this.registerEvents = function(el) {
    scope.$on('addSticky', function() {
      el.addClass('active');
    });

    scope.$on('removeSticky', function() {
      el.removeClass('active');
    });
  };

  this.stickyMonitor = function() {
    var docHeight = doc && doc.scrollTop || body && body.scrollTop;

    if (docHeight > targetOffset) {
      scope.$emit('addSticky');
    } else {
      scope.$emit('removeSticky');
    }
  };

  angular.element($window).bind('scroll', this.stickyMonitor);
});

app.directive('sticky', function() {
  return {
    restrict: 'C',
    controller: 'StickyCtrl',
    compile: function(tElement, tAttrs) {
      return {
        pre: function preLink(scope, element, attrs, ctrl) {
          element.wrap('<div class="sticky-nav container-fluid"></div>');
          var parent = element.parent();
          ctrl.registerEvents(parent);
        }
      }
    }
  }
});

app.service('firebase', function($firebaseObject) {
  var firebaseObject = $firebaseObject;
  var ref = new Firebase('https://popping-heat-9561.firebaseio.com/');

  this.getFirebaseData = function() {
    return firebaseObject(ref);
  };
});

})()
