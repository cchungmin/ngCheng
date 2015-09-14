(function () {

'use strict';

var querySelector = document.querySelector.bind(document);
var ctn = querySelector('.ctn-curtain');

var app = angular.module('app', ['firebase']);

app.controller('MainCtrl', function($scope, $element, firebase) {
  this.data = firebase.getFirebaseData();

  this.sayHello = function() {
    console.log(this.data.user);
  };
});

app.controller('StickyCtrl', function($scope, $element, $window, firebase) {
  var scope = $scope;
  var element = $element;
  var doc = document.documentElement;
  var body = document.body;
  var target = document.querySelector('.profile');
  var targetOffset = target.offsetTop;
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

    if (docHeight > lastPosOffsetTop) {
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
  var ref = new Firebase('https://popping-heat-9561.firebaseio.com/');

  this.getFirebaseData = function() {
    return $firebaseObject(ref);
  };
});

})()
