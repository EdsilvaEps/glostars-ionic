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
        //.constant("baseURL", "http://localhost:8100/api")
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

                //test user id: 246c96bd-8bc4-402c-be1b-ded5f2b4ee87

        }])

        .factory('competitionFactory', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){

            var pics = [];

            pics.getCompetitionPics = function(){
                /*
                var config = {
                    "headers" : {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer WBCQGgAJ2f6J9RD6xCRp5Jy8uU0AiKW30qPsiACZM0Ih7gruXl5OLIpCmV_fQ2TVmos1ZnJevanjt48K1VjzpWDfoymRa_jGdX27bfDaIOA2KbcLPfy0hDTqJXGaY-RPty_3SVICXSQvOb2CRMzwZc8OWYzS8uIE1O2k4zG59RKuAqDpE5Ra34pvzjiJsgDnVDIJjqWZK84rgQgQEqt89SFHKJvHeFE7D5wft5csb5tmOCbkf8GUMUf7pUhDfRZoJaAFmzkgPv-Twq0baCCzphAZ-g2_2OahisGzDBjQH6jOdB5fc2C5drMjV1s9NcFwie3ws-5bxwOpGzShje0Y__I4DyJvwu_7psTJYYTDxN6-3TdObI2n59usqFbdgagsy7fc4esTBxv_Eok_BkrwfhSwFs69OMxR8_GzDzO4a3xC0N9pNrU98nJul-FbvpqVCfCuyYQmR05SRePmP16qNYiCzmesp4KaOfzWedc4LetgRfzOpJ9k-arBZuOczZ5Ox5OFjiCKm9YWBlMvgBP0fs4urV_1xfE4pLS3JTCb_NFWOlWaobYdhbSkRxq2B9ivsmJ0q7YYQfBZDM8aNUK16ecz-k6JSvV1S9yx6vKHXOY'
                    }
                };

                $http.get(baseURL+'/images/competition/12', config)
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
                */

                return $resource(baseURL+'/images/competition/:id');

            };

            return pics;



            //this function returns the competition photos (TEST)
            //return $resource(baseURL+"/api/images/competition/:id");

        }])


        .factory('myUser', ['$resource', 'baseURL', function($resource, baseURL){

            var myUser = {
                name: '',
                email: null,
                profilePicUrl: null,
                userId: null
            };

        }])

        .factory('usersFactory', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){

            var user = {
                name: '',
                email: null,
                profilePicUrl: null,
                userId: null
            };


            var usersCache = [];
            var userFac = {};
            var res;

            userFac.searchUser = function(email, token, userid){

                var route = null, info = null;

                if(email !== null){
                    route = "api/account/userinfo/?userEmail=";
                    info = email;
                } else if(userid !== null){
                    route = "api/account/userinfo/?userId=";
                    info = userid;
                } else return route;

                return $http({
                    method:'GET',
                    url: baseURL + route + info,
                    headers:{
                        'Auth':'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    unique:true
                }).then(function successCallback(response){

                    //getting specic user data
                    console.log('USER RETRIEVED');
                    res = response.data.resultPayload;

                    user = {
                          name: res.name,
                          email: res.email,
                          profilePicUrl: res.profilePicURL,
                          userId: res.userId
                    };
                    console.log(user);

                    //pushing user data into stack of cached users
                    usersCache.push(user);



                }, function errorCallback(response){
                    console.log('ERROR RETRIEVING USER');
                    console.log(response);
                });
            };


            userFac.getUser = function(){
                return user;
            };


            userFac.getUserStack = function(){
                return usersCache;
            };


            return userFac;




        }])

        .factory('picsFactory', ['baseURL', '$http', '$ionicLoading', function(baseURL, $http, $ionicLoading){
            var pics = [];
            var intoken = null;

            pics.getUserPictures = function(id, count, token){
                console.log('GETTING USER PICS');

                $ionicLoading.show({
                            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                        });


                      return $http({
                        method:'GET',
                        url: baseURL + "api/images/user/" + id + "/" + count,
                        headers:{
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    }).then(function successCallback(response){

                        $ionicLoading.hide();
                        console.log(response.data.message);
                        console.log(response.data.resultPayload);
                        //pictures = response.data.resultPayload;
                        //console.log(pictures);
                        pics = response.data.resultPayload;
                        //return response.resultPayload;


                    }, function errorCallback(response){
                        $ionicLoading.hide();
                        console.log('Error retrieving pics');
                        console.log(response.data);
                    });


            };

            pics.getAllpictures = function(){
                var pictures = [];
                if(pics.competitionPictures.length > 0 ){
                  for(var i = pics.competitionPictures.length; i >= 0; i --){
                    if(pics.competitionPictures[i] !== undefined)
                      pictures.push(pics.competitionPictures[i]);
                  }
                }
                if(pics.mutualFollowerPictures.length > 0){
                  for(var i = pics.mutualFollowerPictures.length; i >= 0; i --){
                    if(pics.mutualFollowerPictures[i] !== undefined)
                        pictures.push(pics.mutualFollowerPictures[i]);
                  }
                }
                if(pics.publicPictures.length > 0){
                  for(var i = pics.publicPictures.length; i >= 0; i --){
                    if(pics.publicPictures[i] !== undefined)
                        pictures.push(pics.publicPictures[i]);
                  }
                }
                return pictures;
            };



            return pics;




        }])


        .factory('AuthService', ['$resource', 'baseURL', '$http', '$ionicLoading', '$ionicPopup','$cordovaNetwork', function($resource, baseURL, $http, $ionicLoading, $ionicPopup ){
            //authentication factory


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

                //formatting the form data into server parameters
                loginData = {
                    grant_type: "password",
                    password: credentials.password,
                    username: credentials.email

                };

                var res;
                if(userAuth.access_token === null){

                        $ionicLoading.show({
                            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                        });

                        return $http({
                            method:'POST',
                        url: 'http://www.glostars.com/Token',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                            //Transforming data into x-www-form-urlencode type
                            transformRequest: function(obj) {
                                var str = [];
                                for(var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: loginData,
                            unique: true

                        }).then(function successCallback(response){
                            console.log("SUCCESS!");
                            //console.log(response);

                            $ionicLoading.hide();

                            res = response.data;

                            userAuth = {
                                access_token: res.access_token,
                                token_type: res.token_type,
                                expires_in: res.expires_in,
                                username: res.userName,
                                issued: res.issued,
                                expires: res.expires
                            };

                            //return authService.isAuthenticated();

                            console.log(res);
                        }, function errorCallback(response){

                            $ionicLoading.hide();

                            console.log("ERROR!");
                            if(response.status === 400){

                                var alertPopup = $ionicPopup.alert({
                                    title: 'Login failed',
                                    template: 'Login or password incorrect. Response: '+ response.status
                                });
                            } else {

                                var alerPopup = $ionicPopup.alert({
                                    title: 'Login failed',
                                    template: 'servers currently unavailable: ' + response.status
                                });
                            }

                            console.log(response.status);
                            //return authService.isAuthenticated();
                        });

            }


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


            authService.getExpiryDate = function(){
                return userAuth.expires;
            };


            authService.isAuthenticated = function(){
                if(userAuth.access_token !== null){
                    if(userAuth.username === loginData.username){
                        console.log("we are good to go");
                        return true;
                    }
                }
                console.log("we are NOT good to go");
                return false;
            };

            return authService;


        }])


        .factory('RegisterService', ['$resource', 'baseURL', '$http', '$q', '$cordovaFacebook', '$ionicPopup',  function($resource, baseURL, $http, $q, $cordovaFacebook, $ionicPopup){

            var registerData = {
                UserName: null,
                Email: null,
                Name: null,
                BirthdayYear: 0,
                BirthdayMonth: 0,
                BirthdayDay: 0,
                Gender: null,
                LastName: null,
                Password: null

            };

            var register = {};

            register.createAccount = function(username, email, name, bdayy, bdaym, bdayd, gender, lastname, pwd){

               $ionicLoading.show({
                            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                        });

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



                return $http({
                    method:'POST',
                    url: baseURL+'api/account/register',
                    data: registerData,
                    unique:true

                }).then(function successCallback(response){
                        $ionicLoading.hide();

                         console.log('SUCCESSFULLY REGISTERED');
                         console.log(response.message);
                        //return response;

                }, function errorCallback(response){
                        $ionicLoading.hide();

                        console.log("ERROR!");
                        //res = response.data;
                        console.log(response);
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


        //service for notifications
        .factory('NotificationService', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){

            var notifications = [];

            notifications.getNotifications = function(userId){

                $http.get(baseURL + 'api/notifications/user/'+ userId)
                    .then(function successCallback(response){

                         console.log('NOTICATIONS SEIZED');
                         console.log(response.message);
                         console.log(response.resultPayload);

                         notifications = response.resultPayload;
                        //return response;

                    }, function errorCallback(response){

                        console.log("ERROR IN NOTIFICATION SERVICE!");
                        //res = response.data;
                        console.log(response);
                });

                return notifications;
            };


            return notifications;

        }])


        .factory('PictureService',['$cordovaCamera', 'cordovaImagePicker', function($cordovaCamera, $cordovaImagePicker){

            var image = {};

            var cameraOptions = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 100,
                targetHeight: 100,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false

            };

            var galleryOptions = {
                maximumImagesCount:1, // Max number of selected pics
                width: 800,
                height: 800,
                quality: 100
            };

            image.galleryPicker = function(){

                $cordovaImagePicker.getPictures(optgallery).then(
                function(results){
                    //Loop through acquired images
                    for(var i = 0; i < results.length; i++){
                        console.log('Image URI: ' + results[i]);
                    }
                }, function(error){
                    console.log('Error: ' + JSON.stringify(error));
                    //in case of error
                });

            };



            image.takePicture = function(){
                $cordovaCamera.getPicture(cameraOptions).then(function(imageData){
                    image = "data:image/jpeg;base64," + imageData;

                }, function(err){
                    console.log(err);
                });

                return image;
            };

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
                removeItem: function(key){
                    $window.localStorage.removeItem(key);
                }
            };
        }])

;
