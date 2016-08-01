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
      this.galleryConfig = {
        key: '2543988-fd5c4b4e8fbea278ea06181b8',
        q: 'mountain+forest',
        image_type: 'photo'
      };
    }
  };

  /** @ngInject */
  class GalleryCtrl {
    constructor($scope, $element, $attrs, $compile, $http, $interval) {
      this.scope = $scope;
      this.element = $element;
      this.http = $http;
      this.interval = $interval;
      this.compile = $compile;
      this.attrs = $attrs;
      this.backgroundImages = [];
      this.preloadImages = {};
      this.preloadImages.list = []
      this.randomNum = 0;
      this.stop;
      this.intervalSecs = 5000;
      this.isIntervalFinished = true;
    };

    /**
     * @private
     * @return {string}
     * @ngInject
     */
    buildURL_() {
      let configData = JSON.parse(this.attrs.galleryConfig);
      let parameterStr = '';

      angular.forEach(configData, function(val, key) {
        parameterStr += key + '=' + val + '?';
      });

      return 'https://pixabay.com/api/?' + parameterStr.slice(0, -1);
    };

    /** @ngInject */
    init() {
      let url = this.buildURL_();

      let handleSuccess = (response) => {
        this.backgroundImages = response.hits;
        this.preloadImages_();
        this.startPlaying();
      };

      let handleError = (response) => {
        console.warn(response);
      };

      this.http.get(url)
          .success(handleSuccess)
          .error(handleError);

      this.scope.$watch(() => {
         return this.randomNum;
        } , (newVal, oldVal) => {
        if (newVal !== oldVal) {
          // self.isIntervalFinished = false;
        }
      });
    };

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     * @param {number} min
     * @param {number} max
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
      this.element.addClass('displayed');
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

      let handler = () => {
        this.element.removeClass('displayed');
        this.randomNum = this.getRandomInt(0, 20);
        this.setUpImage_();
        // self.isIntervalFinished = true;
      };

      this.setUpImage_();

      this.stop = this.interval(handler, 10000);
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
     * @param {Array<string>}
     * @private
     * @ngInject
     */
    preloadImages_() {
      if (!this.preloadImages.list) {
        this.preloadImages.list = [];
      }

      let list = this.preloadImages.list;
      for (var i = 0, len = this.backgroundImages.length; i < len; i++) {
        var img = new Image();
        img.onload = () => {
          var index = list.indexOf(this);
          if (index !== -1) {
            // remove image from the array once it's loaded
            // for memory consumption reasons
            list.splice(index, 1);
          }
        };
        list.push(img);
        img.src = this.backgroundImages[i].webformatURL;
      }
    };
  };

  app.controller('GalleryCtrl', GalleryCtrl);

  app.directive('gallery', function() {
    return {
      restrict: 'AC',
      controller: 'GalleryCtrl',
      compile: function compile(tElement, tAttrs) {
        return {
          post: function(scope, iElement, iAttrs, ctrl) {
            ctrl.init();
          }
        }
      }
    };
  });

  app.controller('MainCtrl', MainCtrl);

  app.controller('StickyCtrl', function($scope, $element, $attrs, $window) {
    let scope = $scope;
    let doc = document.documentElement;
    let body = document.body;
    let targetOffset = $attrs.stickyOffset || 0;

    this.registerEvents = (el) => {
      scope.$on('addSticky', () => {
        el.addClass('active');
      });

      scope.$on('removeSticky', function() {
        el.removeClass('active');
      });
    };

    let stickyMonitor = () => {
      let docHeight = (doc && doc.scrollTop || body && body.scrollTop || 0);

      if (docHeight > targetOffset) {
        scope.$emit('addSticky');
      } else {
        scope.$emit('removeSticky');
      }
    };

    angular.element($window).on('scroll', stickyMonitor);
  });

  app.directive('sticky', () => {
    return {
      restrict: 'C',
      controller: 'StickyCtrl',
      compile: (tElement, tAttrs) => {
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
    let firebaseObject = $firebaseObject;
    let ref = new Firebase('https://popping-heat-9561.firebaseio.com/');

    this.getFirebaseData = function() {
      return firebaseObject(ref);
    };
  });
})();
