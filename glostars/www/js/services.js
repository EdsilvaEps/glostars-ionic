'use stric';

// run the server before starting to watch the project:
// on the terminal, type: sudo json-server --watch db.json
// this will start the server that serves the website
// don't forget to be inside the server directory when doing this
// then: sudo gulp watch
// to run automated refactoring of the project and browser watch

// to run unit tests on the project
// go to the tests file
// if it doesnt exists, create one and configure the 
// karma.conf.js file and create the unit tests on the 
// "unit" folder
// then run the karma file with:
// sudo karma start karma.conf.js

angular.module('starter.services',['ngResource'])
        .constant("baseURL", "http://localhost:3000/")
        .constant('AUTH_EVENTS', {
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        })
        .constant('USER_ROLES', {
            all: '*',
            admin: 'admin',
            user: 'user',
        })
        .factory('mainFactory',['$resource', 'baseURL', function($resource, baseURL){
            
                
                //this function returns ALL the photos and data about them uploaded by users currently in the database
                return $resource(baseURL+"photos/:id", null,{'update':{method:'PUT'}});
            
            
            
        }])

        .factory('usersFactory', ['$resource', 'baseURL', function($resource, baseURL){
            
            //this function returns ALL the users and data about them
            return $resource(baseURL+"users/:id", null,{'update':{method:'PUT'}});
              
        }])


        .service('Session', function(){
            //The specifics of this object depends on your back-end implementation, this is a basic example
            this.create = function (sessionId, userId, userRole){  
                this.id = sessionId;
                this.userId = userId;
                this.userRole = userRole;
            };
            
            this.destroy = function(){
                this.id = null;
                this.userId = null;
                this.userRole = null;
            }
    
    
        })

        
        .factory('AuthService', ['$resource', 'baseURL', '$http','Session', function($resource, baseURL, $http, Session){
            //authentication factory
            var sessionId = "someSessionId"; //THIS WILL CHANGE
            var mockRole = "admin";
            var mockUserId = 2;
            var mockCredentials = { //mock user
                email: "pauliina@hotmail.com", 
                password: "pauliina"
            };
            var authService = {};
            
            authService.login = function(credentials) {
                
               
                console.log("fetching user");
                if(credentials.email === mockCredentials.email && credentials.password === mockCredentials.password){
                    
                     console.log("authenticated");
                    
                    //check for the mock credentials and fetch the mock user
                    
                    return $http.get(baseURL + "users/" + mockUserId).then(function(response){
                        Session.create(sessionId, response.id, mockRole);
                        console.log(" new user is " + JSON.stringify(response));
                        return response;
                    },
                    function(response){
                        console.log("login failed");
                    });
                    
                    
                   
                    
                    
                    /*
                    return fetch.get({id:mockUserId}).then(function(response){
                        Session.create(sessionId, response.id, mockRole);
                        console.log(" new user is " + response.name);
                        return response;
                    },
                    function(response){
                        console.log("login failed");
                    });
                    */
                    
                };
                
            };
            
            authService.getMockUser = function(){
                return mockUserId;
            }
            
            authService.isAuthenticated = function(){
                //change this method to do something useful
                return !!Session.userId;
            };
            
            authService.isAuthorized = function(authorizedRoles){
                if(!angular.isArray(authorizedRoles)){
                    authorizedRoles = [authorizedRoles];
                }
                
                return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
            };
            
            return authService;
            
            
        }])

    
        .factory('notifyService',['$resource','$cordovaLocalNotification','$cordovaToast', function($cordovaLocalNotification,$cordovaToast){
            
            var notify = {};
            
            notify.notifyUser = function(message, userPicture, contentPicture){
                $ionicPlatform.ready(function(){
                    $cordovaLocalNotification.schedule({
                        id:1,
                        title: "Glostars",
                        text: message,
                        data: {
                            contentPicture
                        }
                    }).then(function(){
                        console.log("notification sent");
                    },
                        function(){
                        console.log("notification not sent");
                    });
                });
                
            };
            
            
            
            return followers;
            
        }])



        /*
        .config('$resourceProvider', function($resourceProvider){
            $resourceProvider.defaults.stripTrailingSlashes = false;
        
        
            $resourceProvider.interceptors.push([
                '$injector',
                function($injector){
                    return $injector.get('AuthInterceptor');
                }
            ]);
        })
        /*
        .factory('AuthInterceptor', function ($rootScope, $q,
                                      AUTH_EVENTS) {
            return {
                responseError: function (response) { 
                    $rootScope.$broadcast({
                        401: AUTH_EVENTS.notAuthenticated,
                        403: AUTH_EVENTS.notAuthorized,
                        419: AUTH_EVENTS.sessionTimeout,
                        440: AUTH_EVENTS.sessionTimeout
                    }[response.status], response);
                return $q.reject(response);
                }
            };
        })

        */
        
        


        

        .factory('$localStorage', ['$window', function($window) {
            return {
                store: function(key, value) {
                    $window.localStorage[key] = value;
                },
                get: function(key, defaultValue) {
                    return $window.localStorage[key] || defaultValue;
                },
                storeObject: function(key, value) {
                    $window.localStorage[key] = JSON.stringify(value);
                },
                getObject: function(key,defaultValue) {
                    return JSON.parse($window.localStorage[key] || defaultValue);
                },
                removeObject: function(key, value){
                    $window.localStorage[key].removeItem(value);
                }
                
            }
        }])

;