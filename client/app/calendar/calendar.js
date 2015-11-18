angular.module('app.calendar', ['ui.calendar', 'ui.bootstrap', 'app.services'])

.controller('CalendarController', function($scope,$compile,uiCalendarConfig, Habits) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    
    // test events and placeholders
    $scope.events = [
      // {title: 'Code',start: new Date(y, m, 1), end: new Date(y, m, 13)},
      // {title: 'Eat',start: new Date(y, m, d - 5),end: new Date(y, m, d - 2)},
      // {title: 'Sleep',start: new Date(y, m, d + 1, 19, 0),end: new Date(y, m, d + 1, 22, 30),allDay: false},
    ];

    // To do: pull habits from database
    Habits.getHabits().then(function(habits){
      habits.forEach(function(item){
        if (item.status === 'completed' && item.streak > 0){
          var currentStreak = item.streak;
          $scope.events.push({
            title: item['habitName'], 
            start: new Date(y, m, d - currentStreak + 1), 
            end: new Date(y, m, d + 1)
          });          
        }
      });
    })

    /* config object */
    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'title',
          center: '',
          right: '',
        }
      }
    };

    /* event sources array*/
    $scope.eventSources = [$scope.events];
});
/* EOF */
