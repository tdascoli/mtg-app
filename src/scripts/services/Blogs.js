'use strict';

angular.module('mtg-app')
  .factory('Blogs', function ($resource) {
    return $resource('api/blogs/:blogId', {
      blogId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  });
