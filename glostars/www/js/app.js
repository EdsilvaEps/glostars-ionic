// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ngCordova','starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $ionicPopup) {
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
    
    if(window.Connection){
        if(navigator.connection.type == Connection.NONE){
            $ionicPopup.confirm({
                title: "No connection",
                content: "The device is not connected to the internet."
            });
        }
    }
      
  });
    
    
    
    
})


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  //$ionicConfigProvider.tabs.position('bottom');
  //var appID = 1072850062751811;
  //var version = "v2.0";
  //$cordovaFacebookProvider.browserInit(appID, version);
    
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    //templateUrl: 'templates/menu.html',
    
    //controller: 'AppCtrl'
      views: {
        'content@':{
            templateUrl: 'templates/menu.html',
            controller:'AppCtrl',
        }
    }
  })
  
  .state('app.sidemenu',{
      url:'/sidemenu',
      views: {
        'content@':{
            templateUrl: 'templates/sidemenu.html',
            controller:'AppCtrl',
        }
    }
  })
  
  .state('app.login', {
    url: '/login',
    views:{
      'content@':{
          templateUrl:'templates/login.html',
          controller: 'LoginCtrl',
      }
    }
  })
  
  .state('app.profile', { //this will be changed later
    url: '/profile/:id',
    views:{
        'menuContent':{
            templateUrl: 'templates/profile.html',
            controller:'ProfileCtrl',
            resolve:{
              user:['$stateParams', 'usersFactory', function($stateParams, usersFactory){
                  
                  return usersFactory.get({id:parseInt($stateParams.id, 10)});
              }]
            }

        },
        'footer@':{
            templateUrl:'templates/footer.html',
            controller:'FooterCtrl',
        }
    }
  })
  
  .state('app.edit', {
      url: '/edit/:id',
      views:{
          'content@':{
              templateUrl: 'templates/edit.html',
              controller:'EditCtrl',
              resolve:{
              user:['$stateParams', 'usersFactory', function($stateParams, usersFactory){
                  return usersFactory.get({id:parseInt($stateParams.id, 10)});
                    }]
              }
          },
          'footer@':{
              templateUrl:'templates/footer.html',
              controller:'FooterCtrl',
          }
      }
  })
  
  .state('app.settings',{
      url: '/settings',
      views:{
          'content@':{
              templateUrl: 'templates/settings.html',
              controller:'SettingsCtrl',
          },
          'footer@':{
              templateUrl:'templates/footer.html',
              controller:'FooterCtrl',
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
            templateUrl: 'templates/main.html',
            controller:'HomeCtrl',
        },
        'footer@':{
            templateUrl:'templates/footer.html',
            controller:'FooterCtrl',
        }
    }
  })

  .state('app.search', {
    url: '/search',
    views: {
        'content@':{
            templateUrl: 'templates/search.html',
            controller:'SearchCtrl',
        },
        'footer@':{
            templateUrl:'templates/footer.html',
            controller:'FooterCtrl',
        }
    }
  })
  
  .state('app.photoup', {
    url: '/photoup',
    views: {
        'content@':{
            templateUrl: 'templates/photoup.html',
            controller:'PictureUploadCtrl',
        },
        'footer@':{
            templateUrl:'templates/footer.html',
            controller:'FooterCtrl',
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
        'header@':{
            templateUrl:'templates/header.html',
            controller:'HeaderCtrl',
        },
        'menuContent':{
            templateUrl: 'templates/competition.html',
            controller:'CompetitionController',
            resolve:{
                images:['mainFactory', function(mainFactory){
                    return mainFactory.query();
                }],
            }
        },
        'footer@':{
            templateUrl:'templates/footer.html',
            controller:'FooterCtrl',
        }
      }
    })
    .state('app.feedView', {
      url: '/feedView',
      views: {
        'menuContent': {
          templateUrl: 'templates/feedView.html',
          controller: 'FeedViewCtrl'
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
  $urlRouterProvider.otherwise('/app/login');
});
