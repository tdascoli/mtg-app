;(function () {
    'use strict';

    var module = angular.module('mtg.main', ['mtg.chat','mtg.directives','mtg.modals','mtg.playground','mtg.deckbuilder','mtg.socket','mtg.variables','mtg.auth']);

    module.controller('MtgMainCtrl', function ($scope,$rootScope,$location,socket,AuthenticationService,User) {

        $rootScope.countMessage=0;

        $scope.game='';
        $scope.games=[];

        $rootScope.debug=false;

        //$scope.sampleUser = User.$get({'username':'thomas'});
        // create new instance and validations
        /*var newUser = new User({
            username:'thomas',
            email:'thomas@dasco.li',
            password:'rivella'
        });
        newUser.save(function(err, result){
            console.log(newUser._id);  // print out: _id value
            //newUser.remove(); // remove this user from database
        }, function(err){
            //** if something went wrong
        });
        */
        $scope.testUser=function(){
            User.$get({'username':'thomas'}).authenticate('rivella', function(err, result){
                console.log('login',err,result);
            });
        };
        $scope.hostGame=function(){
            socket.emit('host', $scope.game);
            $location.path('/playground/'+$scope.game);
        };

        $scope.debugGame=function(){
            socket.emit('host:debug', 'debug-'+$rootScope.globals.currentUser.username);
            $rootScope.debug=true;
            $location.path('/playground/debug-'+$rootScope.globals.currentUser.username);
        };


        socket.on('host:update', function (games, newgame) {
            console.log(games, newgame);
            $scope.games.push(newgame);
        });

        $scope.getCredentials=function(){
            return AuthenticationService.GetCredentials();
        };

        $scope.logout=function(){
            AuthenticationService.ClearCredentials();
            $location.path('/login');
        };
    });

}());