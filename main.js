(function() {
  'use strict';

  var app = angular.module('app', ['firebase']);

  app.controller('MainCtrl', function($scope, $element, firebase,
      pixabay, $http) {
    this.data = firebase.getFirebaseData();
    var url = 'https://pixabay.com/api/?key=2543988-fd5c4b4e8fbea278ea06181b8&q=yellow+flowers&image_type=photo';
    var http = $http;
    var profile = null;
    var images = pixabay.getImages();

    http.get(url).success(function(response) {
      profile = response.data.hits;
    }).error(function(response) {
      console.warn(response);
    });

    this.getProfileData = function() {
      return profile;
    };

    angular.element(document).ready(function() {
      console.log(images);
    });
  });

  app.controller('StickyCtrl', function($scope, $element, $window, firebase) {
    var scope = $scope;
    var doc = document.documentElement;
    var body = document.body;
    var targetOffset = 10;
        // document.querySelector('.profile').offsetTop;
    this.data = firebase.getFirebaseData();

    this.registerEvents = function(el) {
      scope.$on('addSticky', function() {
        el.addClass('active');
      });

      scope.$on('removeSticky', function() {
        el.removeClass('active');
      });
    };

    var stickyMonitor = function() {
      var docHeight = (doc && doc.scrollTop || body && body.scrollTop || 0);

      if (docHeight > targetOffset) {
        scope.$emit('addSticky');
      } else {
        scope.$emit('removeSticky');
      }
    };

    angular.element($window).on('scroll', stickyMonitor);
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
        };
      }
    };
  });

  app.service('firebase', function($firebaseObject) {
    var firebaseObject = $firebaseObject;
    var ref = new Firebase('https://popping-heat-9561.firebaseio.com/');

    this.getFirebaseData = function() {
      return firebaseObject(ref);
    };
  });

  app.service('pixabay', function($http) {
    var pixabay = {};
    var pixabayUrl = 'https://pixabay.com/api/?key=2543988-fd5c4b4e8fbea278ea06181b8&q=yellow+flowers&image_type=photo';
    var images = [];

    $http.get(pixabayUrl).then(function(res) {
      images = res.data.hits;
      console.log(images);
    }, function(res) {
      console.log(res);
    });

    pixabay.getImages = function() {
      return images;
    };

    return pixabay;
  });
})();
