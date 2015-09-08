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
  this.data = firebase.getFirebaseData();

  var doc = document.documentElement;
  var body = document.body
  var target = document.querySelector('.profile');
  var targetOffset = target.offsetTop;

  angular.element($window).bind('scroll', function() {
    var docHeight = doc && doc.scrollTop || body && body.scrollTop;

    if (docHeight > targetOffset) {
      scope.$emit('addSticky');
    } else {
      scope.$emit('removeSticky');
    }
  });
});

app.directive('sticky', function() {
  return {
    restrict: 'C',
    controller: 'StickyCtrl',
    compile: function(tElement, tAttrs, transclude) {
      return {
        pre: function preLink(scope, element, attrs, ctrl) {
          element.wrap('<div class="sticky-nav container-fluid"></div>');
          var parent = element.parent();
          scope.$on('addSticky', function() {
            if (!parent.hasClass('active')) {
              parent.addClass('active');
            }
          });

          scope.$on('removeSticky', function() {
            if (parent.hasClass('active')) {
              parent.removeClass('active');
            }
          });
        }
      }
    }
  }
});

app.service('firebase', function($firebaseObject) {
  var ref = new Firebase('https://popping-heat-9561.firebaseio.com/');
  this.firebaseData = $firebaseObject(ref);

  this.getFirebaseData = function() {
    return this.firebaseData
  };
});

})()
