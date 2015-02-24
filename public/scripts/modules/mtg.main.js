;(function () {
    'use strict';

    var module = angular.module('mtg.main', ['mtg.auth']);

    module.controller('MtgMainCtrl', function ($scope,$location,AuthenticationService) {

        $scope.getCredentials=function(){
            return AuthenticationService.GetCredentials();
        };

        $scope.logout=function(){
            AuthenticationService.ClearCredentials();
            $location.path('/login');
        };
    });

    module.controller('SignupCtrl', function ($scope,$location,User) {

        $scope.user = new User();
        $scope.signUpMsg=false;

        $scope.register=function(){
            $scope.user.save(function(err, result){

                console.log('SAVE',$scope.user._id,err,result);
            });
        };
    });

}());