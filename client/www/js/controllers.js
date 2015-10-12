angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', ['Login', '$scope', '$ionicModal', '$timeout', 
  function(Login, $scope, $ionicModal, $timeout){
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
  }
])

.controller('RegisterCtrl', ['Register', '$scope', '$timeout', '$location', 
  function(Register, $scope, $timeout, $location){

    $scope.registerData = {}

    $scope.doRegister = function(){
      console.log("Browser Console - Registering in with ", $scope.registerData);
      Register.registerIn($scope.registerData);
      // Simulate a login delay.  Remove and replace later with login code and login system
      $timeout(function(){
        $location.path('#/app/search');
      }, 1000);
    };
  }
])

//retrieves results of search
.controller('SearchResultsCtrl', ['$scope', '$location', 'Search', 
  function($scope, $location, Search){
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
  }
])

// Intialize map
.controller('MapController', ['$scope', '$ionicLoading', 
  function($scope, $ionicLoading) {
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
  }
])

.controller('ListingCtrl', ['Listing', '$scope', '$ionicModal', 
  function(Listing, $scope, $ionicModal){

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

  }
])

.controller('HistoryCtrl', ['Login', 'Historie', '$scope', '$location', 
  function(Login, Historie, $scope, $location){

    // if (Login.userID === null) {
    //   $location.path('#/app/profile');
    // }

    $scope.histories = Historie.query();

  }
])

.controller('ProfileCtrl', ['$scope', '$timeout', '$location', 
  function($scope, $timeout, $location){
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

  }
])

//adding from greenfield

.controller('AuthCtrl', ['$rootScope', '$scope', '$window', '$location', 'Auth', '$auth', 
  function ($rootScope, $scope, $window, $location, Auth, $auth) {
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
])

.controller('EditCtrl', ['$rootScope', '$scope', '$location', 'Habits', 
  function($rootScope, $scope, $location, Habits) {
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
])

.controller('DashboardCtrl', ['$rootScope', '$scope', '$location', 'Habits', 'Events', 
  function($rootScope, $scope, $location, Habits, Events) {
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
])

.controller('CreateCtrl', ['$rootScope', '$scope', '$location', 'Habits', 
  function($rootScope, $scope, $location, Habits) {
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
])
