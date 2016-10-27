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

        .factory('competitionFactory', ['$resource', 'baseURL', '$http','$rootScope', function($resource, baseURL, $http, $rootScope){

            var pics = [];
            var compics = [];

            pics.getCompetitionPics = function(count, token){

                return $http({
                  method:'GET',
                  url: baseURL + "api/images/competition/" + count,
                  headers:{
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token
                  }
              }).then(function successCallback(response){
                  compics = response.data.resultPayload;
                  console.log('competition pics');
                  console.log(response.data);

              }, function errorCallback(response){
                  console.log('ERROR ON COMPETITION PICS');
                  console.log(response.data.status);
              });



            };

            pics.getPics = function(){
              return compics;

            };

            return pics;



            //this function returns the competition photos (TEST)
            //return $resource(baseURL+"/api/images/competition/:id");

        }])


        .factory('usersFactory', ['$resource', 'baseURL', '$http', '$ionicPopup', function($resource, baseURL, $http, $ionicPopup){

            var user = {
                name: '',
                email: null,
                profilePicUrl: null,
                userId: null
            };


            var users = [];
            var userFac = {};
            var res;

            userFac.searchUser = function(email, token, userid){

                var route = null, info = null;

                if(email !== null){
                    route = "api/account/GetUserInfo?userEmail=";
                    info = email;
                } else if(userid !== null){
                    route = "api/account/GetUserInfoById?userId=";
                    info = userid;
                } else return route;

                return $http({
                    method:'GET',
                    url: baseURL + route + info,
                    headers:{
                        'Authorization':'Bearer ' + token,
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




                }, function errorCallback(response){


                    console.log("ERROR!");

                    console.log(response.status);
                    //return authService.isAuthenticated();
                });
            };

            userFac.findUserByName = function(name, token){
                return $http({
                  method:'GET',
                  url: baseURL + "api/account/GetUserListByName?Name=" + name,
                  headers:{
                      'Auth':'Bearer ' + token,
                      'Content-Type': 'application/json'
                  }
                }).then(function successCallback(response){

                      console.log('USER SEARCH RETURNED:');

                      users = response.data.resultPayload;
                      console.log(users);
                      //return users;
                }, function errorCallback(response){

                      console.log('ERROR IN USER SEARCH BY NAME');
                      console.log(response.status);
                      //return null;
                });
            };


            userFac.getUser = function(){
                return user;
            };


            userFac.getUserSearchList = function(){
                return users;
            };


            return userFac;




        }])

        .factory('picsFactory', ['baseURL', '$http', '$ionicLoading','$rootScope', function(baseURL, $http, $ionicLoading, $rootScope){
            var pics = [];
            var pics_number = 0;

            pics.getUserPictures = function(id, count, token){
                console.log('GETTING USER PICS');
                /*
                $ionicLoading.show({
                            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                        });
                        */
                        console.log(baseURL);
                        console.log(token);
                      return $http({
                        method:'GET',
                        url: baseURL + "api/images/user/" + id + "/" + count, //here
                        headers:{
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    }).then(function successCallback(response){

                        //$ionicLoading.hide();
                        console.log(response.data);
                        console.log(response.data.resultPayload);
                        pics_number = response.data.resultPayload;
                        pics = response.data.resultPayload.model;



                    }, function errorCallback(response){
                        //$ionicLoading.hide();
                        console.log('Error retrieving pics');
                        console.log(response.data);
                    });


            };

            pics.getPicsAmount = function() {
              var amount = pics_number.totalCompetitonPic + pics_number.totalmutualFollowerPics + pics_number.totalpublicPictures;
              return amount;

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
                $rootScope.$broadcast('pictures-loaded');
                pics = [];
                return pictures;
            };

            var publicPics = [];
            pics.getPublicPictures = function(count, token){
                console.log('GETTING USER PICS');

                /*
                $ionicLoading.show({
                            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                        });
                        */

                      return $http({
                        method:'GET',
                        url: baseURL + "api/images/public/" + count,
                        headers:{
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    }).then(function successCallback(response){

                        //$ionicLoading.hide();
                        console.log(response.data);
                        console.log('public pics');
                        publicPics = response.data.resultPayload.picsToReturn;


                    }, function errorCallback(response){
                        //$ionicLoading.hide();
                        console.log('Error retrieving pics');
                        console.log(response.data);
                    });


            };

            pics.getPublic = function(){
                $rootScope.$broadcast('pictures-loaded');
                return publicPics;
            };



            //--- rating ----//
            pics.ratePicture = function(picId, rating, token){
              var rate = {
                  NumOfStars: rating,
                  PhotoId: picId
              };

              return $http({
                method:'POST',
                url: baseURL + "api/images/rating",
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                data:rate

            }).then(function successCallback(response){
                if(response.data.responseCode == 1){
                  $rootScope.$broadcast('rate-success');
                }
                console.log(response.data);

            }, function errorCallback(response){
                console.log('ERROR RATING PIC');
                console.log(response.data);
            });

          };

          var newComment = {};

          pics.commentPicture = function(picId, message, token){
              var comment = {
                  CommentText: message,
                  PhotoId: picId
              };

              return $http({
                  method:'POST',
                  url: "http://www.glostars.com/" + "api/images/comment",
                  headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                  },
                  data: comment

                }).then(function successCallback(res){
                    console.log(res.data.message);
                    console.log(res.data.resultPayload);
                    $rootScope.$broadcast('comment-success');
                    newComment = res.data.resultPayload;

                }, function errorCallback(res){
                    console.log('ERROR IN COMMENT SERVICE');
                    $rootScope.$broadcast('comment-fail');
                    return null;
                });

          };

          pics.getNewComment = function(){
              return newComment;
          };

          pics.deleteComment = function(commentId, token){
             return $http({
                method: 'GET',
                url: baseURL + "api/images/DeleteComment?commentId=" + commentId,
                headers:{
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                }

             }).then(function successCallback(res){
                  console.log(res.data);

             }, function errorCallback(res){
                  console.log('ERROR WITH DELETING COMMENT');
             });
          };





            return pics;




        }])

        .factory('CommentFactory',['baseURL', '$http','$ionicLoading','$rootScope', function(baseURL, $http, $ionicLoading, $rootScope){

          //comment factory to test comment functionality
          var comment = [];
          var newComment = {};

          comment.commentPicture = function(picId, message, token){
              var comment = {
                  CommentText: message,
                  PhotoId: picId
              };

              return $http({
                  method:'POST',
                  url: "http://www.glostars.com/" + "api/images/comment",
                  headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                  },
                  data: comment

                }).then(function successCallback(res){
                    console.log(res.data.message);
                    console.log(res.data.resultPayload);
                    $rootScope.$broadcast('comment-success');
                    newComment = res.data.resultPayload;

                }, function errorCallback(res){
                    console.log('ERROR IN COMMENT SERVICE');
                    $rootScope.$broadcast('comment-fail');
                    return null;
                });

          };

          comment.getNewComment = function(){
              return newComment;
          };

          comment.deleteComment = function(commentId, token){
             return $http({
                method: 'GET',
                url: baseURL + "api/images/DeleteComment?commentId=" + commentId,
                headers:{
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + token
                }

             }).then(function successCallback(res){
                  console.log(res.data);

             }, function errorCallback(res){
                  console.log('ERROR WITH DELETING COMMENT');
             });
          };

        return comment;

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

        .factory('UploadFactory', ['$resource', 'baseURL', '$http','$ionicLoading','$rootScope',
         function($resource, baseURL, $http, $ionicLoading, $rootScope){

            var uploadData = {
                Description: null,
                IsCompeting: false,
                Privacy: null,
                ImageDataUri: null
            };

            var upload = {};

            upload.UploadPicture = function(description, isCompeting, privacy, imgUri, token){

              $ionicLoading.show({
                  template: '<p>Loading...</p><ion-spinner></ion-spinner>'
              });



                uploadData = {
                    Description: description,
                    IsCompeting: isCompeting,
                    Privacy: privacy,
                    ImageDataUri: imgUri
                };

                return $http({
                    method:'POST',
                    url: baseURL+'api/images/upload',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token},
                    data: uploadData,
                    unique:true

                }).then(function successCallback(response){
                        $ionicLoading.hide();

                         console.log('SUCCESSFULLY UPLOADED');
                         $rootScope.broadcast('upload-success');
                        //return response;

                }, function errorCallback(response){
                        $ionicLoading.hide();

                        console.log("ERROR IN PICTURE UPLOAD");
                        $rootScope.broadcast('upload-fail');
                        //res = response.data;
                        //console.log(response);
                });


            };

            return upload;



        }])


        //service for cations
        .factory('NotificationService', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){

            var notifications = [];
            var notes = [];

            notifications.getNotifications = function(userId, token){

                return $http({
                  method:'GET',
                  url: baseURL + 'api/notifications/user/'+ userId,
                  headers:{
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token
                  }

                }).then(function successCallback(response){

                     console.log('NOTICATIONS SEIZED');
                     console.log(response.data.resultPayload);
                     console.log(response.data);

                     notes = response.data.resultPayload;

                }, function errorCallback(response){

                    console.log("ERROR IN NOTIFICATION SERVICE!");
                    //res = response.data;
                    console.log(response);
                });


            };

            notifications.getNotes = function(){
              return notes;
            };


            return notifications;

        }])

        .factory('FollowerService', ['baseURL', '$http','$ionicLoading', function(baseURL, $http, $ionicLoading){

            var friends = {}; //people who follow you, and whom you follow are friends, simple
            var holder = {};
            var holder_mine = {};


            friends.loadFollowers = function(usrId, token, isMe){
                return $http({
                    method:'GET',
                    url: baseURL + "api/account/GetUserFollowById?userId=" + usrId,
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    }
                }).then(function successCallback(response){
                      $ionicLoading.hide();
                      console.log('friends retrieved');

                      holder = response.data.resultPayload;
                      if(isMe) holder_mine = response.data.resultPayload; //important
                      // /console.log(holder);

                }, function errorCallback(response){
                      $ionicLoading.hide();
                      console.log('ERROR IN GETTING FOLLOWERS SERVICE');
                      console.log(response.status);
                });

                return friends;
            };

            friends.rate = function(picId, rating){
              //implement rating here
            };

            friends.follow = function(usrId, token){
                //method for following users (userId)

                $ionicLoading.show({
                            template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                });


                return $http({
                    method:'POST',
                    url: baseURL + "api/Follower/Following/" + usrId,
                    headers:{
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token
                    }
                }).then(function successCallback(response){

                    console.log("you're now following this user ");
                    console.log(response.data);
                    //REFRESH FOLLOWERS LIST AFTER FOLLOWING SOMEONE

                }, function errorCallback(response){

                    console.log('ERROR WITH FOLLOWING USER:');
                    console.log(response.status);
                });
            };

            friends.unfollow = function(usrId, token){
                $ionicLoading.show({
                          template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                        });

                return $http({
                    method:'POST',
                    url: baseURL + "api/Follower/Unfollowing/" + usrId,
                    headers:{
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ' + token
                    }
                }).then(function successCallback(response){

                    console.log("you're not following this user anymore");
                    console.log(response.data);
                    //REFRESH FOLLOWERS LIST AFTER Unfollowing SOMEONE
                }, function errorCallback(response){

                    console.log('ERROR WITH UNFOLLOWING USER:');
                    console.log(response.status);
                });

            };



            friends.getFollowers = function(){
                return holder.followerList;
            };

            friends.getFollowing = function(){
                return holder.followingList;
            };

            friends.getMyFriends = function(){
                return holder_mine;
            };

            return friends;

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
