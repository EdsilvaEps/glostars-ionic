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

//when using SUDO to run android builds on ionic
//add the suffix -E as in "sudo -E run android"
//to keep the environment variables' permission

angular.module('starter.services',['ngResource'])
        //.constant("baseURL", "http://localhost:3000/")
        .constant("baseURL", "http://www.glostars.com/")
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

        .factory('competitionFactory', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){
            
            var pics = [];
            
            pics.getCompetitionPics = function(){
                
                var config = {
                    "headers" : {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WBCQGgAJ2f6J9RD6xCRp5Jy8uU0AiKW30qPsiACZM0Ih7gruXl5OLIpCmV_fQ2TVmos1ZnJevanjt48K1VjzpWDfoymRa_jGdX27bfDaIOA2KbcLPfy0hDTqJXGaY-RPty_3SVICXSQvOb2CRMzwZc8OWYzS8uIE1O2k4zG59RKuAqDpE5Ra34pvzjiJsgDnVDIJjqWZK84rgQgQEqt89SFHKJvHeFE7D5wft5csb5tmOCbkf8GUMUf7pUhDfRZoJaAFmzkgPv-Twq0baCCzphAZ-g2_2OahisGzDBjQH6jOdB5fc2C5drMjV1s9NcFwie3ws-5bxwOpGzShje0Y__I4DyJvwu_7psTJYYTDxN6-3TdObI2n59usqFbdgagsy7fc4esTBxv_Eok_BkrwfhSwFs69OMxR8_GzDzO4a3xC0N9pNrU98nJul-FbvpqVCfCuyYQmR05SRePmP16qNYiCzmesp4KaOfzWedc4LetgRfzOpJ9k-arBZuOczZ5Ox5OFjiCKm9YWBlMvgBP0fs4urV_1xfE4pLS3JTCb_NFWOlWaobYdhbSkRxq2B9ivsmJ0q7YYQfBZDM8aNUK16ecz-k6JSvV1S9yx6vKHXOY'
                    }
                };
                
                $http.get(baseURL+'api/images/competition/12', config)
                    .success(function(response){
                    
                        console.log(response);
                        return response;
                    })
                    .error(function(data, status, header, config){
                        console.log("ERROR");
                        console.log("data: "+ data +" status:"+ 
                                   header + " config: " + config);
                        
                        return null;
                    });
                
                
            };
            
            return pics;
            
            
            
            //this function returns the competition photos (TEST)
            //return $resource(baseURL+"/api/images/competition/:id");
            
        }])

        .factory('usersFactory', ['$resource', 'baseURL', function($resource, baseURL){
            
            //this function returns ALL the users and data about them
            return $resource(baseURL+"users/:id", null,{'update':{method:'PUT'}});
              
        }])

        .factory('picsFactory', ['mainFactory', 'baseURL', function(mainFactory, baseURL){
            var pics = [];
            
            pics.getUserPictures = function(id){
                pics = mainFactory.query(
                    
                    function(res){
                        var list = res;
            
                        for(var i = list.length; i < 0; i++){
                            if(list[i].userId === id){
                                pics.push(list[i]);
                            }
                        }
                        
                    });
            };
            
            pics.getCompetitionPics = function(){
                pics = mainFactory.query(
                    function(res){
                        
                        var list = res;
                        
                        for(var i = list.length; i < 0; i++){
                            if(list[i].category === 'competition'){
                                pics.push(list[i]);
                            }
                        }
                        
                    });
            };
            
            return pics;
            
            
            
            
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

        
        .factory('AuthService', ['$resource', 'baseURL', '$http','Session',  function($resource, baseURL, $http, Session){
            //authentication factory
            var mockToken = 'WBCQGgAJ2f6J9RD6xCRp5Jy8uU0AiKW30qPsiACZM0Ih7gruXl5OLIpCmV_fQ2TVmos1ZnJevanjt48K1VjzpWDfoymRa_jGdX27bfDaIOA2KbcLPfy0hDTqJXGaY-RPty_3SVICXSQvOb2CRMzwZc8OWYzS8uIE1O2k4zG59RKuAqDpE5Ra34pvzjiJsgDnVDIJjqWZK84rgQgQEqt89SFHKJvHeFE7D5wft5csb5tmOCbkf8GUMUf7pUhDfRZoJaAFmzkgPv-Twq0baCCzphAZ-g2_2OahisGzDBjQH6jOdB5fc2C5drMjV1s9NcFwie3ws-5bxwOpGzShje0Y__I4DyJvwu_7psTJYYTDxN6-3TdObI2n59usqFbdgagsy7fc4esTBxv_Eok_BkrwfhSwFs69OMxR8_GzDzO4a3xC0N9pNrU98nJul-FbvpqVCfCuyYQmR05SRePmP16qNYiCzmesp4KaOfzWedc4LetgRfzOpJ9k-arBZuOczZ5Ox5OFjiCKm9YWBlMvgBP0fs4urV_1xfE4pLS3JTCb_NFWOlWaobYdhbSkRxq2B9ivsmJ0q7YYQfBZDM8aNUK16ecz-k6JSvV1S9yx6vKHXOY';
            
            var mockUserId = 2;
            var mockCredentials = { //mock user
                email: "pauliina@hotmail.com", 
                password: "pauliina"
            };
            var authService = {};
            
            var userAuth = {
                access_token: null,
                token_type: null,
                expires_in: 0,
                username: null,
                issued: null,
                expires: null
                
            };
            
            var loginData = {
                grant_type:'',
                password: null,
                username: null
            };
            
            // login routines
            authService.login = function(credentials) {
                
                loginData = {
                    grant_type: 'password',
                    password: credentials.password,
                    username: credentials.email
                    
                };
            
                var config = {
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };
                
                $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=UTF-8';
                
                console.log("check: ");
                console.log(config.headers);
                console.log("path: " + baseURL+'Token');
                console.log(loginData);
                
                //baseURL+'Token'
                
                $http.post('http://www.glostars.com/Token', loginData, config)
                .then(function(response){
                    console.log(response);
                    console.log('logged');
                    return response;  
                })
                .catch(function(response){
                    console.error('some error', response.status, response.data);
                })
                .finally(function(){
                    console.log("finally something arrived");
                });
                
                    /*
                    .success(function(response){
                        
                        
                        
                    })
                    .error(function(data, status, header, config){
                        console.log("ERROR");
                        console.log("data: "+ data +" status:"+ 
                                   header + " config: " + config);
                        
                        return null;
                    });
                */
                
                
            };
                
                
               
            
            authService.getAuthentication = function(){
                return userAuth.access_token;
            };
            
            authService.getTokenType = function(){
                return userAuth.token_type;
            };
        
            
            authService.getUsername = function(){
                return userAuth.username;
            };
            
            authService.getExpireDate = function(){
                return userAuth.expires;
            };
            
            
            
            authService.isAuthenticated = function(){
                if(userAuth.access_token !== null){
                    if(userAuth.username === loginData.username){
                        return true;
                    }
                }
                
                return false;
            };
            
            authService.getMockUser = function(){
                return mockUserId;
            };
            
            
            
            authService.isAuthorized = function(authorizedRoles){
                if(!angular.isArray(authorizedRoles)){
                    authorizedRoles = [authorizedRoles];
                }
                
                return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
            };
            
            return authService;
            
            
        }])


        .factory('RegisterService', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){
            
            var registerData = {
                UserName: null,
                Email: null,
                Name: null, 
                BirthdayYear: 0000,
                BirthdayMonth: 00,
                BirthdayDay: 00,
                Gender: null,
                LastName: null,
                Password: null
                
            };
            
            var register = {};
            
            register.createAccount = function(username, email, name, bdayy, bdaym, bdayd, gender, lastname, pwd){
                
                registerData = {
                    UserName: username,
                    Email: email, 
                    Name: name, 
                    BirthdayYear: bdayy,
                    BirthdayMonth: bdaym,
                    BirthdayDay: bdayd,
                    Gender: gender,
                    LastName: lastname,
                    Password: pwd
                };
                
                
                var config = {
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };
                
                
                $http.post(baseURL+'api/account/register', registerData, config)
                    .success(function(response){
                    
                        console.log(response);
                        return response;
                    })
                    .error(function(data, status, header, config){
                        console.log("ERROR");
                        console.log("data: "+ data +" status:"+ 
                                   header + " config: " + config);
                        
                        return null;
                    });
                
            };
            
            return register;
            
        }])
       
        .factory('UploadFactory', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){
            
            var uploadData = {
                Description: null,
                IsCompeting: false,
                Privacy: null,
                ImageDataUri: null
            };
            
            var upload;
            
            upload.UploadPicture = function(description, isCompeting, privacy, imgUri){
                uploadData = {
                    Description: description,
                    IsCompeting: isCompeting,
                    Privacy: privacy,
                    ImageDataUri: imgUri
                };
                
                
                var config = {
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };
                
                $http.post(baseURL+'api/images/upload', uploadData, config)
                    .success(function(response){
                    
                        console.log(response);
                        return response;
                    })
                    .error(function(data, status, header, config){
                        console.log("ERROR");
                        console.log("data: "+ data +" status:"+ 
                                   header + " config: " + config);
                        
                        return null;
                    });
                
                
                
            };
            
            return upload;
            
            
            
        }])
        

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