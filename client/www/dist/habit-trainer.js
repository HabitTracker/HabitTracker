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

.run(function($ionicPlatform, $rootScope, $location, $interval, Auth, Events, Habits) {
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
})

// Custom directive ng-enter, this listens for the enter key
.directive('ngEnter', function () {
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
})

.directive('d3Bars',function ($window, $timeout) {
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
)

// Client Side Routing

.factory('AttachTokens', function ($window) {
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
})

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $authProvider){
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


});


angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function(Login, $scope, $ionicModal, $timeout){
  // Controllers in Ionic are only called when they are recreated or on 
  // app start, instead of every page change

  $scope.loginData = {}

  // Create login modal
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal){
    $scope.modal = modal;
  })

  // Triggered in login modal to close
  $scope.closeLogin = function(){
    $scope.modal.hide();
  };

  //Open the login modal
  $scope.login = function(){
    $scope.modal.show();
  };

  // Perform login action when the user submits the login form
  $scope.doLogin = function(){
    console.log("Browser Console - Logging in with ", $scope.loginData);
    Login.signIn($scope.loginData);
    // Simulate a login delay.  Remove and replace later with login code and login system
    $timeout(function(){
      $scope.closeLogin();
    }, 1000);
  };

})

.controller('RegisterCtrl', function(Register, $scope, $timeout, $location){

  $scope.registerData = {}

  $scope.doRegister = function(){
    console.log("Browser Console - Registering in with ", $scope.registerData);
    Register.registerIn($scope.registerData);
    // Simulate a login delay.  Remove and replace later with login code and login system
    $timeout(function(){
      $location.path('#/app/search');
    }, 1000);
  };
})

//retrieves results of search
.controller('SearchResultsCtrl', function($scope, $location, Search){
  // dummy data
  $scope.searches = [
    {id: 1, address: '1600 Amphitheatre Pkwy, Mountain View, CA', seller: 'Joe', price: 10, lat: 37.422245, lng: -122.0840084},
    {id: 2, address: '1 World Way, Los Angeles, CA', seller: 'John', price: 15, lat: 33.94224, lng: -118.40279},
    {id: 3, address: '652 Polk St San Francisco, CA', seller: 'Katherine', price: 20, lat: 37.78291, lng: -122.41902},
    {id: 4, address: 'Dick\'s Sporting Goods Concord, NH 03301 United States', seller: 'Christina', price: 25, lat: 43.22697, lng: -71.48562},
    {id: 5, address: 'Highland Middle School, 15027 Bel-Red Rd Bellevue, WA 98007, United States', seller: 'Bob', price: 30, lat: 47.62657, lng: -122.14020},
    {id: 6, address: '582 Sutter St San Francisco, CA 94102', seller: 'Bob', price: 30, lat: 37.78918, lng: -122.40993},
    {id: 7, address: '678 Post St San Francisco, CA 94109', seller: 'Bob', price: 30, lat: 37.78776, lng: -122.41295},
    {id: 8, address: '850 Bush St San Francisco, CA 94108', seller: 'Bob', price: 30, lat: 37.79003, lng: -122.41134},
    {id: 9, address: '144 Taylor St San Francisco, CA 94102', seller: 'Bob', price: 30, lat: 37.78391, lng: -122.41067},
    {id: 10, address: '912 Sutter St San Francisco, CA 94104', seller: 'Bob', price: 30, lat: 37.78854, lng: -122.41548},
    {id: 11, address: '754 Post St San Fran cisco, CA 94109', seller: 'Bob', price: 30, lat: 37.78778, lng: -122.41436},
    {id: 12, address: '670 Larkin St San Francisco, CA 94109', seller: 'Bob', price: 30, lat: 37.78407, lng: -122.41759},
    {id: 13, address: '798 Sutter St San Francisco, CA 94109', seller: 'Bob', price: 30, lat: 37.78878, lng: -122.41347},
    {id: 14, address: '871 Sutter St San Francisco, CA 94109', seller: 'Bob', price: 30, lat: 37.78823, lng: -122.41459},
    {id: 15, address: '619 Taylor St San Francisco, CA 94102', seller: 'Bob', price: 30, lat: 37.78820, lng: -122.41204}
  ];


  var map;
  var markers = [];
  var globalInfowindow = null;

  //Called when input is submitted
  $scope.getSearches = function(input){
    // get coordinates for input
    var mapOptions;
    var myLatlng = $scope.AddressToLocation(input, function(location){

      // console.log(location); // {H: 37.422245, L: -122.0840084}
      var mapOptions = {
        zoom: 19,
        // map gets centered here
        center: location
      };
      map = new google.maps.Map(document.getElementById("map"), mapOptions);

      // Adds an event listener for when map is done changing/zooming      
      google.maps.event.addListener(map, 'idle', $scope.showMarkers);

      // Drops a custom marker for searched address
      $scope.addMarkerGeo(location, map);
    });
  };

  // Show Markers gets called whenever map is done changing/zooming
  $scope.showMarkers = function(){
    // Get longitudinal and latitudinal boundaries
    var bounds = map.getBounds(); 
      // bounds object looks like this {Ka: {j: #, H: #}, Ga: {j: #, H: #}}
      // Ka = lat, Ka.j = top boundary, Ka.H = bottom boundary
      // Ga = long, Ga.j = left boundary, Ga.H = right boundary
    
    // Call the server with ajax passing it the bounds  



    //============ Happening server-side ================
    //*** replace searches with the data from database***

      // filter markers
      var filtered = $scope.searches.filter(function(parkingSpot){
        // Boolean for whether parkingSpot is in the boundary
        var withinBoundary = parkingSpot.lat < bounds.Ka.j && parkingSpot.lat > bounds.Ka.H 
            && parkingSpot.lng < bounds.Ga.H && parkingSpot.lng > bounds.Ga.j;
        return withinBoundary;
      });
    //===================================================

    // In the callback delete the current markers and add new markers
      // delete current markers
        $scope.clearMarkers();


      // read current markers
      // *** dummy data, replace filtered with the filtered array from the server later ***
        filtered.forEach(function(obj) {
          markers.push($scope.addMarker(obj,map));
        });

  };

  //Clear current markers
  $scope.clearMarkers = function(){
    for (var i = 0; i < markers.length; i++){
      markers[i].setMap(null);
    }
    markers = [];
  }

  // Add marker to map for the input to search bar
  $scope.addMarkerGeo = function(location, map) {
    var marker = new google.maps.Marker({
      map: map,
      position: location,
      icon: './../img/green-dot.png',
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    return marker;
  }

  // Get latitude and longitude coords from Address
  $scope.AddressToLocation = function(addressString, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': addressString}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        callback(results[0].geometry.location);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }

  // Add marker while iterating through array of database results
  $scope.addMarker = function(obj, map) {
    var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(obj.lat,obj.lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    $scope.addInfoWindow(obj, marker);
    return marker;
  }

  // Adds popup info to marker when clicked on  
  $scope.addInfoWindow = function(obj, marker) {
  var contentString = "<div>"+"Address: "+obj.address+"</div>"+
                      "<div>"+"Seller: "+obj.seller+"</div>"+
                      "<button>Book the space!!!</button>";
  var infowindow = new google.maps.InfoWindow({
      content: contentString
    });
  marker.addListener('click', function(){
      if (globalInfowindow) {
        globalInfowindow.close();
      }
      globalInfowindow = infowindow;
      globalInfowindow.open(map,marker);
    });
  }

  // $scope.addressArray = function(queryArray) {
  //   return _.map(queryArray, function(element){
  //     if (element.address !== undefined)
  //       return element.address;
  //   });
  // }
})

// Intialize map
.controller('MapController', function($scope, $ionicLoading) {
    $scope.initialise = function() {
        var myLatlng = new google.maps.LatLng(37.3000, -120.4833);
        var mapOptions = {
            center: myLatlng,
            zoom: 19,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        var marker;

        navigator.geolocation.getCurrentPosition(function(pos) {
            console.log(pos);
            map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                map: map,
                title: "My Location"
            });
        });

        $scope.map = map;

        google.maps.event.addListener(map, 'click', function(event) {
            if (marker) { 
              marker.setMap(null); 
            }
            marker = new google.maps.Marker({ position: event.latLng, map: map});
        });
    };
    google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialise());


})

.controller('ListingCtrl', function(Listing, $scope, $ionicModal){

  $scope.listings = [];

  $ionicModal.fromTemplateUrl('templates/addListingModal.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function () {
    $scope.modal.show();
  };

  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });

  $scope.addListing = function (data) {
    console.log('data is: ',data);
    var listing = {
      address: data.address,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      startTime: data.startTime,
      endTime: data.endTime,
      startHours: new Date(data.startTime).getUTCHours(),
      startMinutes: new Date(data.startTime).getUTCMinutes(),
      endHours: new Date(data.endTime).getUTCHours(),
      endMinutes: new Date(data.endTime).getUTCMinutes(),
      price: data.price
    };
    Listing.addListing(listing);
    $scope.listings.push(listing);
    data.address = null;
    data.startDate = null;
    data.endDate = null;
    data.startTime = null;
    data.endTime = null;
    data.price = 0;
    $scope.closeModal();
  };

})

.controller('HistoryCtrl', function(Login, Historie, $scope, $location){

  // if (Login.userID === null) {
  //   $location.path('#/app/profile');
  // }

  $scope.histories = Historie.query();

})

.controller('ProfileCtrl', function($scope, $timeout, $location){
  $scope.profileInfo = [{
    firstName: "bob",
    lastName: "Amory",
    emailAddress: "bobAmory@gmail.com",
    physicalAddress: "123 Fake Street, USA",
    phoneNumber: "123-456-7890",
    username: "bobAmory"
  }];

  $scope.profileChangeInfo = {};

  $scope.doProfileChange = function(){
    
    console.log("Browser Console - Registering in with ", $scope.profileChangeInfo);
    $scope.profileChangeInfo = {};
    // Simulate a login delay.  Remove and replace later with login code and login system
    $timeout(function(){
      $location.path('#/app/search');
    }, 1000);
  };

})

//adding from greenfield

.controller('AuthCtrl', function ($rootScope, $scope, $window, $location, Auth, $auth) {
    $rootScope.showNav = false;
    $scope.user = {};

    // Satellizer authentication
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function () {
          $location.path('/');
        })
        .catch(function (error) {
          $scope.alert = error.data.message;
        });
    };

    $scope.signin = function () {
      Auth.signin($scope.user)
        .then(function (token) {
          $window.localStorage.setItem('habit_token', token);
          $location.path('/dashboard');
        })
        .catch(function (error) {
          $scope.alert = error.data.message;
        });
    };

    $scope.signup = function () {
      Auth.signup($scope.user)
        .then(function (token) {
          $window.localStorage.setItem('habit_token', token);
          $location.path('/dashboard');
        })
        .catch(function (error) {
          $scope.alert = error.data.message;
        });
    };

    if ($location.path() === '/signout') {
      Auth.signout();
    }
  }
)

.controller('EditCtrl', function($rootScope, $scope, $location, Habits) {
    $rootScope.showNav = true;

    $scope.habit = Habits.getEdit();

    $scope.updateHabit = function() {
      Habits.updateHabit($scope.habit)
        .then(function() {
          $rootScope.$broadcast('habitChange');
          $location.path('/dashboard');
        })
        .catch(function(err) {
          console.error(err);
        });
    };

    $scope.deactivateHabit = function() {
      $scope.habit.active = false;
      Habits.updateHabit($scope.habit)
        .then(function() {
          $rootScope.$broadcast('habitChange');
          $location.path('/dashboard');
        })
        .catch(function(err) {
          console.error(err);
        });
    };
  }
)

.controller('DashboardCtrl', function($rootScope, $scope, $location, Habits, Events) {
    $rootScope.showNav = true;

    $scope.testHabits = [
      {habitName: 'Submit a Pull Request', streak: 5, checkinCount: 25, failedCount: 3, reminderTime: '2:30 PM', dueTime: '4:30 PM', streakRecord: 15, active:true},
      {habitName: 'Complete a Pomodoro', streak: 10, checkinCount: 20, failedCount: 4, reminderTime: '2:30 PM', dueTime: '4:30 PM', streakRecord: 20, active:true},
      {habitName: 'Workout', streak: 8, checkinCount: 15, failedCount: 2, reminderTime: '2:30 PM', dueTime: '4:30 PM', streakRecord: 8, active:true}
    ];

    $scope.colors = ["#1f77b4", "#ff7f0e", "#2ca02c"];

    $scope.buttonState = function (habit, state) {
      if (state === 'pending') {
        return habit.status === 'pending'
          || habit.status === 'remind'
          || habit.status === 'reminded'
      }
      if (state === 'completed') {
        return habit.status === 'completed';
      }
      if (state === 'failed') {
        return habit.status === 'failed' ||
          habit.status === 'missed';
      }
    }

    $scope.getHabits = function () {
      Habits.getHabits()
        .then(function(habits) {
          // original
          // $scope.habits = habits
          // code for testing
          $scope.habits = $rootScope.sample ? $scope.testHabits : habits;

          // change var name if you want to use deactivated habits on the frontend
          $scope.habits = $scope.habits.filter(function(habit) {
            return habit.active;
          });
          // Stuff for Habit Streaks chart
          $scope.habitStreaks = $scope.habits.filter(function (habit) {
            return habit.streak > 0;
          });
          // Stuff for Habit Score chart
          $scope.totalFailed = $scope.habits.reduce(function (res, habit) {
            console.log('failedCount:', habit.failedCount);
            return res + habit.failedCount;
          }, 0);
          $scope.totalCompleted = 0;
          $scope.habitsCompleted = $scope.habits.map(function (habit) {
            $scope.totalCompleted += habit.checkinCount;
            return habit.completed;
          });
          $scope.score = Math.round($scope.totalCompleted / ($scope.totalCompleted + $scope.totalFailed) * 100);
          console.log('completed:', $scope.totalCompleted);
          console.log('failed:', $scope.totalFailed);
          console.log('score:', $scope.score);
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    $scope.getHabits();  // Invoke to render active habits on dashboard

    $scope.toggleSampleData = function () {
      $rootScope.sample = !$rootScope.sample;
      $location.path('/');
    };

    $scope.formatDonut = function (value) {
        return value;
    };

    $scope.editHabit = function(habit) {
      Habits.setEdit(habit);
      $location.path('/edit');
    };

    $scope.checkinHabit = function(habit) {
      Habits.checkinHabit(habit)
        .then(function() {
          $scope.getHabits();
          $location.path('/');
        })
        .catch(function(error) {
          console.error(error);
        });
    };

  }
)

.controller('AuthCtrl', function ($rootScope, $scope, $window, $location, Auth, $auth) {
    $rootScope.showNav = false;
    $scope.user = {};

    // Satellizer authentication
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(function () {
          $location.path('/');
        })
        .catch(function (error) {
          $scope.alert = error.data.message;
        });
    };

    $scope.signin = function () {
      Auth.signin($scope.user)
        .then(function (token) {
          $window.localStorage.setItem('habit_token', token);
          $location.path('/dashboard');
        })
        .catch(function (error) {
          $scope.alert = error.data.message;
        });
    };

    $scope.signup = function () {
      Auth.signup($scope.user)
        .then(function (token) {
          $window.localStorage.setItem('habit_token', token);
          $location.path('/dashboard');
        })
        .catch(function (error) {
          $scope.alert = error.data.message;
        });
    };

    if ($location.path() === '/signout') {
      Auth.signout();
    }
  }
)

.controller('CreateCtrl', function($rootScope, $scope, $location, Habits) {
    $rootScope.showNav = true;
    $scope.habit = {};
    Habits.getHabits()
      .then(function(habits) {
        var count = 0;
        habits.forEach(function(habit) {
          count += habit.active ? 1 : 0;
        });
        if (count < 3) {  // Currently hard coded. Limit must be retrieved from backend.
          $scope.showCreate = true;
          $scope.showLimitExceed = false;
        } else {
          $scope.showCreate = false;
          $scope.showLimitExceed = true;
        }
      })
      .catch(function(error) {
        console.error(error);
      });

    $scope.addHabit = function() {
      Habits.addHabit($scope.habit)
        .then(function() {
          $rootScope.$broadcast('habitChange');
          $location.path('/dashboard');
        })
        .catch(function(err) {
          console.error(err);
        });
    };
  }
)

.controller('DashboardCtrl', function($rootScope, $scope, $location, Habits, Events) {
    $rootScope.showNav = true;

    $scope.testHabits = [
      {habitName: 'Submit a Pull Request', streak: 5, checkinCount: 25, failedCount: 3, reminderTime: '2:30 PM', dueTime: '4:30 PM', streakRecord: 15, active:true},
      {habitName: 'Complete a Pomodoro', streak: 10, checkinCount: 20, failedCount: 4, reminderTime: '2:30 PM', dueTime: '4:30 PM', streakRecord: 20, active:true},
      {habitName: 'Workout', streak: 8, checkinCount: 15, failedCount: 2, reminderTime: '2:30 PM', dueTime: '4:30 PM', streakRecord: 8, active:true}
    ];

    $scope.colors = ["#1f77b4", "#ff7f0e", "#2ca02c"];

    $scope.buttonState = function (habit, state) {
      if (state === 'pending') {
        return habit.status === 'pending'
          || habit.status === 'remind'
          || habit.status === 'reminded'
      }
      if (state === 'completed') {
        return habit.status === 'completed';
      }
      if (state === 'failed') {
        return habit.status === 'failed' ||
          habit.status === 'missed';
      }
    }

    $scope.getHabits = function () {
      Habits.getHabits()
        .then(function(habits) {
          // original
          // $scope.habits = habits
          // code for testing
          $scope.habits = $rootScope.sample ? $scope.testHabits : habits;

          // change var name if you want to use deactivated habits on the frontend
          $scope.habits = $scope.habits.filter(function(habit) {
            return habit.active;
          });
          // Stuff for Habit Streaks chart
          $scope.habitStreaks = $scope.habits.filter(function (habit) {
            return habit.streak > 0;
          });
          // Stuff for Habit Score chart
          $scope.totalFailed = $scope.habits.reduce(function (res, habit) {
            console.log('failedCount:', habit.failedCount);
            return res + habit.failedCount;
          }, 0);
          $scope.totalCompleted = 0;
          $scope.habitsCompleted = $scope.habits.map(function (habit) {
            $scope.totalCompleted += habit.checkinCount;
            return habit.completed;
          });
          $scope.score = Math.round($scope.totalCompleted / ($scope.totalCompleted + $scope.totalFailed) * 100);
          console.log('completed:', $scope.totalCompleted);
          console.log('failed:', $scope.totalFailed);
          console.log('score:', $scope.score);
        })
        .catch(function (error) {
          console.error(error);
        });
    };

    $scope.getHabits();  // Invoke to render active habits on dashboard

    $scope.toggleSampleData = function () {
      $rootScope.sample = !$rootScope.sample;
      $location.path('/');
    };

    $scope.formatDonut = function (value) {
        return value;
    };

    $scope.editHabit = function(habit) {
      Habits.setEdit(habit);
      $location.path('/edit');
    };

    $scope.checkinHabit = function(habit) {
      Habits.checkinHabit(habit)
        .then(function() {
          $scope.getHabits();
          $location.path('/');
        })
        .catch(function(error) {
          console.error(error);
        });
    };

  }
)


  // Point of this module is to create a Session service
// that uses the Angular resource module (ngResource)
// to retrieve data using REST services

angular.module('starter.services', ['ngResource'])

//Uses angular resource module to provice access to REST services at specified endpoint
// Externalize the server parameters in a config module for the future

.factory('Search', function($resource){
  return $resource('http://localhost:5000/search/:searchId');
})

.factory('Historie', function($resource){
  return $resource('/api/history/:historyId');
})

.factory('Login', function($http){
  var userID = null;
  return {
    signIn: function(loginData) {
      return $http({
        method: 'POST',
        url: '/api/login',
        data: loginData
      })
      .then(function(response){
        console.log('response: ',response);
        //set the userID here
        return response.data.token;       
      });
    },
    userID: userID
  };
})

// .factory('Login', function($resource){
//   return $resource('api/login');
// })

.factory('Register', function($http){
  var userID = null;
  return {
    registerIn: function(registerData) {
      return $http({
        method: 'POST',
        url: '/api/register',
        data: registerData
      })
      .then(function(response){
        return response.data.token;
        console.log(response);
      });
    },
    userID: userID
  };
})

// .factory('Register', function($resource){
//   return $resource('api/register');
// })

.factory('Listing', function($http){
  return {
    getListings: function() {
      return $http({
        method: 'GET',
        url: '/api/listing'
      })
      .then(function(response){
        return response.data;
        console.log(response.data);
      });
    },
    addListing: function(listing) {
      console.log('iminaddlisting');
      return $http({
        method: 'POST',
        url: '/api/listing',
        data: listing
      })
      .then(function(response){
        return response.data.token;
        console.log(response);
      });
    }
  };
})


.factory('Profile', function($resource){
  return $resource('http://localhost:5000/profile/:profileId');
})

//adding from greenfield



.factory('Habits', function($http, $sanitize, $interpolate, notify) {

    var _habit = {};
    var service = {};

    service.getHabits = function() {
      return $http({
        method: 'GET',
        url: '/api/users/habits'
      })
      .then(function(resp) {
        return resp.data.habits;
      });
    };

    service.addHabit = function(habit) {
      habit.habitName = $sanitize(habit.habitName);
      return $http({
        method: 'POST',
        url: '/api/users/habits',
        data: habit
      });
    };

    service.setEdit = function(habit) {
      _habit = habit;
      _habit.reminderTime = new Date(_habit.reminderTime);
      _habit.dueTime = new Date(_habit.dueTime);
    };

    service.getEdit = function(habit) {
      return _habit;
    };

    service.updateHabit = function(habit) {
      return $http({
        method: 'PUT',
        url: '/api/users/habits/' + habit._id,
        data: habit
      });
    };

    service.statusChange = function(habitEvent) {
      var exp = $interpolate(habitEvent.message)
      var message = exp({habitName: habitEvent.habit.habitName, eventTime: habitEvent.eventTime});
      // notify(message);
      return $http({
        method: 'PUT',
        url: '/api/users/habits/' + habitEvent.eventName + '/' + habitEvent.habit._id,
        data: habitEvent.habit
      });
    };

    service.checkinHabit = function(habit) {
      notify('Great job completing your habit!');
      return $http({
        method: 'POST',
        url: '/api/records/' + habit._id,
        data: habit
      });
    };

    return service;

  }
)

.factory('Auth', function ($http, $location, $window, $auth, $sanitize) {

    var signin = function (user) {
      user.username = $sanitize(user.username);
      user.password = $sanitize(user.password);
      return $http.post('/authenticate/signin', user)
        .then(function (resp) {
          return resp.data.token;
        });
    };

    var signup = function (user) {
      user.username = $sanitize(user.username);
      user.password = $sanitize(user.password);
      return $http.post('/authenticate/signup', user)
        .then(function (resp) {
          return resp.data.token;
        });
    };

    var isAuth = function () {
      return !!$window.localStorage.getItem('habit_token')
    };

    var signout = function () {
      $auth.logout()
        .then(function() {
          $location.path('/signin');
        });
    };

    return {
      signin: signin,
      signup: signup,
      isAuth: isAuth,
      signout: signout
    };
  }
)

.factory('Events', function (Habits) {

    // Notification messages
    var eventMessages = {
      reminded: 'Reminder: {{habitName}} is due at {{eventTime | date: "shortTime"}}!',
      failed: 'Habit failed!  You did not complete {{habitName}} by the due time of {{eventTime | date: "shortTime"}}!',
    };

    // event constructor
    var Event = function(habit, eventName, eventTime) {
      this.habit = habit;
      this.eventName = eventName;
      this.eventTime = eventTime;
      this.message = eventMessages[eventName];
    }

    var getEventQueue = function (habits) {
      return habits
        // filter out past-due events and send out notifications
        // for any of which have not been yet notified
        .reduce(function(queue, habit) {
          var failEvent = new Event(habit, 'failed',  habit.dueTime);
          var remindEvent = new Event(habit, 'reminded', habit.reminderTime);
          // if habit dueTime missed
          if (habit.status === 'missed') {
            // display failed notification
            Habits.statusChange(failEvent);
            // keep the current queue
            return queue;
          } else if (habit.status === 'remind') {
            // display reminded notification
            Habits.statusChange(remindEvent);
            // add fail event to the queue
            return queue.concat(remindEvent);
          } else if (habit.status === 'pending') {
            // add remind event and fail event to the queue
            return queue.concat(remindEvent, failEvent);
          }
          return queue;
        }, [])

        // Sort events chronologically by eventTime
        .sort(function (eventA, eventB) {

          return eventA.eventTime - eventB.eventTime;
        });
    };

    // Trigger notifications for all events past their eventTime
    // and remove triggered events from event queue
    var triggerEvents = function (events) {
      if (!events.length) return;
      var date = new Date();
      var timeNow = (date.getHours() * 60) + date.getMinutes();
      var eventDate = new Date(events[0].eventTime);
      var eventTime = (eventDate.getHours() * 60) + eventDate.getMinutes();
      if (timeNow >= eventTime) {
        var event = events.shift()
        Habits.statusChange(event)
          .then(function () {
            triggerEvents(events);
          });
      }
    };

    return {
      getEventQueue: getEventQueue,
      triggerEvents: triggerEvents
    };
  }
);




