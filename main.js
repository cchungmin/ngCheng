(function() {
  'use strict';

  var app = angular.module('ngCheng', [
    'ngAnimate',
    'firebase']
  );

  /** @ngInject */
  class MainCtrl {
    constructor(firebase) {
      this.data = firebase.getFirebaseData();
    }
  };

  /** @ngInject */
  class GalleryCtrl {
    constructor($scope, $element, $attrs, $http, $interval) {
      var URL = 'https://pixabay.com/api/?key=2543988-fd5c4b4e8fbea278ea06181b8&q=mountain+forest&image_type=photo';
      this.scope = $scope;
      this.element = $element;
      this.http = $http;
      this.interval = $interval;
      this.backgroundImages = [];
      this.randomNum = 0;
      this.config = $attrs.galleryConfig;
      this.stop;
      this.intervalSecs = 5000;
      this.isIntervalFinished = true;

      this.init(URL);
    };

    /**
     * @private
     * @ngInject
     */
    buildURL_() {
      var configData = JSON.parse('"' + this.config + '"');
      console.log(configData.test);
    };

    /** @ngInject */
    init(url) {
      var self = this;
      var u = this.buildURL_();

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
          // self.isIntervalFinished = false;
        }
      });
    };

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     * @ngInject
     */
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * @private
     * @ngInject
     */
    setUpImage_() {
      this.element.css('background-image', 'url(' +
          this.backgroundImages[this.randomNum].webformatURL + ')');
    };

    /**
     * @ngInject
     */
    startPlaying() {
      if (angular.isDefined(this.stop)) {
        return;
      }

      var self = this;
      var handler = function() {
        self.randomNum = self.getRandomInt(0, 20);
        self.setUpImage_();
        // self.isIntervalFinished = true;
      };

      this.setUpImage_();

      this.stop = this.interval(handler, 5000);
    };

    /**
     * @ngInject
     */
    stopPlaying() {
      if (angular.isDefined(this.stop)) {
        this.interval.cancel(this.stop);
        this.stop = undefined;
      }
    };

    /**
     * @private
     * @ngInject
     */
    preloadImages_(arr) {
      if (!preloadImages.list) {
        preloadImages.list = [];
      }

      var list = preloadImages.list;
      for (var i = 0, len = arr.length; i < len; i++) {
        var img = new Image();
        img.onload = function() {
          var index = list.indexOf(this);
          if (index !== -1) {
            // remove image from the array once it's loaded
            // for memory consumption reasons
            list.splice(index, 1);
          }
        };
        list.push(img);
        img.src = arr[i];
      }
    };
  };

  app.controller('GalleryCtrl', GalleryCtrl);

  app.directive('gallery', function() {
    return {
      restrict: 'AC',
      controller: 'GalleryCtrl',
      link: function() {
        console.log('test');
      }
    };
  });

  app.controller('MainCtrl', MainCtrl);

  app.controller('StickyCtrl', function($scope, $element, $attrs, $window) {
    var scope = $scope;
    var doc = document.documentElement;
    var body = document.body;
    var targetOffset = $attrs.stickyOffset;

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
            element.wrap('<div class="sticky-nav"></div>');

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
