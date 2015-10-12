// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 
  'starter.controllers',
  'starter.services',
  'ngRoute',
  'ngSanitize',
  'gridshore.c3js.chart',
  'satellizer',
  'cgNotify'])



.run(['$ionicPlatform', '$rootScope', '$location', '$interval', 'Auth', 'Events', 'Habits',
  function($ionicPlatform, $rootScope, $location, $interval, Auth, Events, Habits) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
      if (typeof google === 'undefined' || typeof google === undefined) {
        console.log("Google maps unavailable");
      }
      $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
          $location.path('/signin');
        }
      });
      var timer;
      var eventScheduler = function() {
        console.log('eventScheduler start');
        Habits.getHabits()
          .then(function (habits) {
            events = Events.getEventQueue(habits);
            timer = $interval(function() {
              if (events.length) {
                Events.triggerEvents(events);
              }
            }, 1000);
          });
      };
      eventScheduler();
      $rootScope.$on('habitChange', eventScheduler);
    });
  }
])

// Custom directive ng-enter, this listens for the enter key
.directive('ngEnter', 
  function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
  }
)

.directive('d3Bars',['$window', '$timeout', function ($window, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        data: '=', // bi-directional data-binding
        label: '@',
        onClick: '&'
      },
      link: function(scope, ele, attrs) {
        var renderTimeout;
        var margin = parseInt(attrs.margin) || 0,
            barHeight = parseInt(attrs.barHeight) || 40,
            barPadding = parseInt(attrs.barPadding) || 10;

        var svg = d3.select(ele[0])
          .append('svg')
          .style('width', '100%');

        $window.onresize = function() {
          scope.$apply();
        };

        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          scope.render(scope.data);
        });

        scope.$watch('data', function(newData) {
          scope.render(newData);
        }, true);

        scope.render = function(data) {
          svg.selectAll('*').remove();

          if (!data) return;
          if (renderTimeout) clearTimeout(renderTimeout);

          renderTimeout = $timeout(function() {
            var width = d3.select(ele[0])[0][0].offsetWidth - margin,
                height = scope.data.length * (barHeight + barPadding),
                color = d3.scale.category10(),
                xScale = d3.scale.linear()
                  .domain([0, d3.max(data, function(d) {
                    return d.streak;
                  })])
                  .range([0, width]);

            svg.attr('height', height);

            svg.selectAll('rect')
              .data(data)
              .enter()
                .append('rect')
                .on('click', function(d,i) {
                  return scope.onClick({item: d});
                })
                .attr('height', barHeight)
                .attr('width', 140)
                .attr('x', Math.round(margin/2))
                .attr('y', function(d,i) {
                  return i * (barHeight + barPadding);
                })
                .attr('fill', function(d) {
                  return color('#1f77b4');
                  // return color(d.streak);
                })
                .transition()
                  .duration(1000)
                  .attr('width', function(d) {
                    return xScale(d.streak);
                  });
            svg.selectAll('text')
              .data(data)
              .enter()
                .append('text')
                .attr('fill', '#fff')
                .attr('y', function(d,i) {
                  return i * (barHeight + barPadding) + 25;
                })
                .attr('x', 15)
                .text(function(d) {
                  return d.habitName + " (streak: " + d.streak + ")";
                });
          }, 200);
        };
      }
    }
  }
])

// Client Side Routing

.factory('AttachTokens', ['$window', function ($window) {
  return {
    request: function (object) {
      var jwt = $window.localStorage.getItem('habit_token');
      if (jwt) {
        object.headers.Authorization = 'Bearer ' + jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
      }
    };
  }
])

.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$authProvider', 
  function($stateProvider, $urlRouterProvider, $httpProvider, $authProvider){
    $stateProvider

    // The menu state of the app
    .state('app', {
      url: '/app',
      // sets up one state to be the default state of parent
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'AppCtrl'
    })

    //additions

    .state('app.signin', {
      url: '/signin',
      views: {
        'menuContent': {
          templateUrl: 'templates/signin.html',
          controller: 'AuthCtrl'
        }
      }
    })

    .state('app.signup',{
      url: '/signup',
      views: {
        'menuContent': {
          templateUrl: 'templates/signup.html',
          controller: 'AuthCtrl' 
        }
      } 
    })

    .state('app.dashboard',{
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl' 
        }
      },
      authenticate: true
    })  

    .state('app.create', {
      url: '/create',
      views: {
        'menuContent': {
          templateUrl: 'templates/create.html',
          controller: 'CreateCtrl' 
        }
      },
      authenticate: true   
    })

    .state('app.edit', {
      url: '/edit',
      views: {
        'menuContent': {
          templateUrl: 'templates/edit.html',
          controller: 'EditCtrl' 
        }
      },
      authenticate: true   
    })

    //finished with additions

    .state('app.register', {
      url: '/register',
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

    .state('app.history', {
      url: '/history',
      views: {
        'menuContent': {
          templateUrl: 'templates/history.html',
          controller: 'HistoryCtrl'
        }
      }
    })

    .state('app.listing', {
      url: '/listing',
      views: {
        'menuContent': {
          templateUrl: 'templates/listing.html',
          controller: 'ListingCtrl'
        }
      }
    })

    .state('app.searches', {
      url: '/search',
      views: {
        'menuContent': {
          templateUrl: 'templates/search.html',
          controller: 'SearchResultsCtrl'
        }
      }
    })

    .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl'
        }
      }
    });

    //Fallback Route
    $urlRouterProvider.otherwise('/app/dashboard');

    $authProvider.loginUrl = '/signin';
    $authProvider.signupUrl = '/signup';
    $authProvider.tokenPrefix = 'habit';

    $authProvider.google({
      clientId: '416143587162-phs72qq27pfvqua6buqb5lf4okum9krq.apps.googleusercontent.com',
      url: '/authenticate/google'
    });

    $httpProvider.interceptors.push('AttachTokens');


  } 
]);

