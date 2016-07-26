(function() {
  'use strict';

  var app = angular.module('app', [
    'ngAnimate',
    'firebase']
  );

  /** @ngInject */
  var MainCtrl = function($scope, $element, firebase, $http, $interval) {
    var URL = 'https://pixabay.com/api/?key=2543988-fd5c4b4e8fbea278ea06181b8&q=yellow+flowers&image_type=photo';
    this.data = firebase.getFirebaseData();
    this.scope = $scope;
    this.element = $element;
    this.http = $http;
    this.interval = $interval;
    this.backgroundImages = [];
    this.randomNum = 0;
    this.stop;
    this.intervalSecs = 5000;
    this.isIntervalFinished = true;

    this.init(URL);
  };

  /** @ngInject */
  MainCtrl.prototype.init = function(url) {
    var self = this;
    var handleSuccess = function(response) {
      self.backgroundImages = response.hits;
      self.startPlaying();
    };

    var handleError = function(response) {
      console.warn(response);
    };

    this.http.get(url)
        .success(handleSuccess)
        .error(handleError);

    this.scope.$watch(function () {
       return self.randomNum;
      } , function(newVal, oldVal) {
      if (newVal !== oldVal) {
        self.isIntervalFinished = false;
      }
    });
  };

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   * @ngInject
   */
  MainCtrl.prototype.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * @ngInject
   */
  MainCtrl.prototype.startPlaying = function() {
    if (angular.isDefined(this.stop)) {
      return;
    }

    var self = this;

    this.stop = this.interval(function() {
      self.randomNum = self.getRandomInt(0, 20);
      self.isIntervalFinished = true;
    }, 5000);
  };

  /**
   * @ngInject
   */
  MainCtrl.prototype.stopPlaying = function() {
    if (angular.isDefined(this.stop)) {
      this.interval.cancel(this.stop);
      this.stop = undefined;
    }
  };

  app.controller('MainCtrl', MainCtrl);

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
})();
