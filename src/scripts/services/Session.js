'use strict';

angular.module('mtg-app')
  .factory('Session', function ($resource) {
    return $resource('/auth/session/');
  });
