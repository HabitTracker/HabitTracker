angular.module('app.stats', ['ngRoute'])

// .config(['$routeProvider', function($routeProvider) {
//   $routeProvider.when('/view1', {
//     templateUrl: 'stats/stats.html',
//     controller: 'statsCtrl'
//   });
// }])

.controller('statsCtrl', [function() {
  
   // query has form: plot {x1,x2,x3,x4}
   // example: x habits completed each day
  var dataString; //to be defined by number of habits completed per day
  var query = "plot {" + dataString + "}";
   
  var string = '';
  var Client = require('node-wolfram');
  var Wolfram = new Client('KVPVW9-T69XX8463U');
  Wolfram.query("3+6", function(err, result) {
    if (err) console.log(err);
    else{
      for (var a=0; a<result.queryresult.pod.length; a++){
        var pod = result.queryresult.pod[a];
        string += pod.$.title,": \n";
        for (var b=0; b<pod.subpod.length; b++){
          var subpod = pod.subpod[b];
          for(var c=0; c<subpod.plaintext.length; c++){ //plaintext to be replaced with img
            var text = subpod.plaintext[c];
            string +='\t' + text;
          }
        }
      }
    }
    return string;
  });
}]);