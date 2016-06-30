// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
    
    
    
    
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  $ionicConfigProvider.tabs.position('top');
    
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  
  .state('app.login', {
    url: '/login',
    views:{
      'menuContent':{
          templateUrl:'templates/login.html',
          controller: 'LoginCtrl'
      }
    }
  })
  
  .state('app.profile', { //this will be changed later
    url: '/profile/:id',
    views:{
      'menuContent':{
          templateUrl:'templates/profile.html',
          controller: 'ProfileCtrl',
          resolve:{
              user:['$stateParams', 'usersFactory', function($stateParams, usersFactory){
                  return usersFactory.get({id:parseInt($stateParams.id, 10)});
              }]
          }
      }
    }
  })
  
  .state('app.signup', {
    url: '/signup',
    views:{
      'menuContent':{
          templateUrl:'templates/signup.html',
          controller: 'SignUpCtrl'
      }
    }
  })
  
  .state('app.promo', {
    url: '/promo',
    views:{
      'menuContent':{
          templateUrl:'templates/promo.html'
      }
    }
  })
  
  .state('app.home', {
    url: '/home',
    views:{
      'menuContent':{
          templateUrl:'templates/main.html',
          controller:'HomeCtrl'
      }
    }
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html'
        }
      }
    })
   .state('app.competition', {
      url: '/competition',
      views: {
        'menuContent': {
          templateUrl: 'templates/competition.html',
          controller: 'CompetitionController',
            resolve:{
                images:['mainFactory', function(mainFactory){
                    return mainFactory.query();
                }]
            }
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
});
