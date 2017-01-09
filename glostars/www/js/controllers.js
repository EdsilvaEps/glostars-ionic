angular.module('starter.controllers', ['ngResource'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService, usersFactory, $rootScope, $ionicPlatform,
   $cordovaCamera, NotificationService,  $rootScope, picsFactory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  /*
  The angular services `ionicMaterialInk` and `ionicMaterialMotion` are used to activate animations.
  */

  // Form data for the login modal
  $scope.loginData = {};



  //$scope.$state = $state;
//  console.log($scope.$state.current.name);
  var previousState = null;
  $rootScope.$on('state-changed', function(event, args){
      previousState = args;
  });



  $scope.initialPage = function(){
    return (previousState === 'app.login' || previousState === null);
  };
  console.log($scope.initialPage());

  $scope.myGoBack = function(){
    if(!$scope.initialPage()){
      $ionicHistory.goBack();
    }
  };








})



.controller('HeaderCtrl', function($scope,$ionicSideMenuDelegate){
    //header controller
    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
    //change this controller to 'UserCtrl'
})


.controller('LoginCtrl',['$scope','$state','AuthService','$http',
'$resource', 'RegisterService', '$q', '$ionicLoading', '$localStorage',
'$filter','ionicMaterialInk','$ionicSlideBoxDelegate','usersFactory', function($scope,$state,AuthService,$http,$resource,RegisterService,
   $q, $ionicLoading, $localStorage, $filter, ionicMaterialInk, $ionicSlideBoxDelegate, usersFactory){



     var swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        slidesPerView: 1,
        spaceBetween: 30
    });

    $scope.slideTo = function(id){
      swiper.slideTo(id);

    };




    ionicMaterialInk.displayEffect();
    $scope.$state = $state;
    console.log($scope.$state.current.name);
    $scope.token = null;

    $scope.options = {
        loop: false,
        speed: 400,
    };



    $scope.loginData = {};
    var token = $localStorage.getObject('userToken', null);
    var username = $localStorage.getObject('userName', null);
    var tokenExpiry = $localStorage.getObject('tokenExpiry', null);
    //TODO: encrypt data
    //TODO: the swipe screen has three views now, handle them here



    $scope.fastLogin = function() {

        //var date = new Date();
        //date = $filter('date')(date, "dd/MM/yyyy");
        //console.log("fast login");

       if(token !== null && username !== null){
         console.log("fast login check");
          if(AuthService.checkToken(token, tokenExpiry)){

            //save user id before entering the app
            usersFactory.searchUser(username, token)
              .then(function success(res){
                  var myUser = usersFactory.getUser();
                  $localStorage.storeObject('userid', myUser.userId);
                  $state.go('app.home');

              });
          } else {
              //console.log("token: " + token + " username: " + username);
          }

       }

    };

    $scope.doLogin = function(){

        AuthService.clean();

        console.log("login data is:");
        console.log($scope.loginData);
        AuthService.login($scope.loginData)
        .then(function success(response){
            if(AuthService.isAuthenticated()){

                token = AuthService.getAuthentication();
                username = AuthService.getUsername();
                tokenExpiry = AuthService.getExpiryDate();

                $localStorage.storeObject('userToken', token);
                $localStorage.storeObject('userName', username);
                $localStorage.storeObject('tokenExpiry', tokenExpiry)
                console.log('changing view');


                var token = $localStorage.getObject('userToken', null);
                var username = $localStorage.getObject('userName', null);
                var tokenExpiry = $localStorage.getObject('tokenExpiry', null);

                if(token && username && tokenExpiry){

                  //save user id before entering the app
                  usersFactory.searchUser(username, token)
                    .then(function success(res){
                        var myUser = usersFactory.getUser();
                        $localStorage.storeObject('userid', myUser.userId);
                        $localStorage.storeObject('userData', myUser);
                        $state.go('app.home');
                    });

                }

                AuthService.checkToken(token, tokenExpiry);


            }
        }, function failure(res){
             console.log('error');
        });

    };


    $scope.userinfo = {};

    $scope.createAcc = function(){
        console.log($scope.userinfo);

        RegisterService.createAccount($scope.userinfo.email, $scope.userinfo.email, $scope.userinfo.firstname, $scope.userinfo.bday.getFullYear(), $scope.userinfo.bday.getMonth()+1, $scope.userinfo.bday.getDate(), $scope.userinfo.sex, $scope.userinfo.lastname, $scope.userinfo.password)
        .then(function success(response){

            $scope.loginData = {email: $scope.userinfo.email, password: $scope.userinfo.password};

            $scope.doLogin();

        }, function failure(res){

            console.log("user already exists");
        });

    };


    //------------------------- fb sign up --------------//
    //$scope.fbSign = RegisterService.facebookSignIn();


}])


.controller('SettingsCtrl', function($scope, $localStorage, $state, AuthService){
    $scope.logOut = function(){

        $localStorage.removeItem('userToken');
        $localStorage.removeItem('userName');
        $localStorage.removeItem('userid');
        $localStorage.removeItem('userData');
        AuthService.clean();
        $state.go('app.login');

    };

})


.controller('HomeCtrl', ['$scope','usersFactory','picsFactory','$ionicModal','$ionicPopover','$timeout',
'AuthService','$localStorage','FollowerService','competitionFactory','$rootScope','CommentFactory'
, function($scope,usersFactory,picsFactory ,$ionicModal,
$ionicPopover,$timeout,AuthService, $localStorage, FollowerService, competitionFactory,
$rootScope, CommentFactory){

    $scope.message = "Loading...";
    $scope.showFeed = false;
    //$scope.users = [];
    $scope.animIN = null;
    $scope.animOUT = false;
    $scope.refreshing = true;
    var pags_number = 1;

    //-------------- getting my user data ----------------------//

    $scope.myUsername = $localStorage.getObject('userName', null);
    $scope.myUserId = $localStorage.getObject('userid', null);
    $scope.myToken = $localStorage.getObject('userToken', null); //AuthService.getAuthentication();
    $scope.myId = $localStorage.getObject('userid', null); //to make a global id
    console.log($scope.myToken);
    $scope.pics = [];



    $scope.$on('$ionicView.enter', function(e) {
        $scope.pics = [];
        pags_number = 1;
       $scope.doRefresh(false);
    });

    $scope.doRefresh = function(loadMore){
      $scope.refreshing = true;

      if(loadMore){
          pags_number += 1;
          console.log('infinte scroll invoked, pgs:' + pags_number);
      } else {
         FollowerService.loadFollowers($scope.myUserId, $scope.myToken, true);
      }

      usersFactory.searchUser($scope.myUsername, $scope.myToken)
          .then(function success(res){

              $scope.myUser = usersFactory.getUser();
              console.log('my user is');
              console.log($scope.myUser);
              //$localStorage.storeObject('userid', $scope.myUser.userId);


              picsFactory.getMutualPictures($scope.myUser.userId, pags_number, $scope.myToken)
                .then(function successCallback(res){

                  var mutualPics = picsFactory.getMutual();
                  mutualPics = picsFactory.replacePic_2(mutualPics);
                  //prevent duplicates
                  for(var i = 0; i < mutualPics.length; i++){

                      $scope.pics.push(mutualPics[i]);



                  }

                  $timeout(function(){

                      //to avoid jamming the phone in cases of error
                      if(mutualPics.length > 0){
                        console.log('refresh is false');
                        $scope.refreshing = false;
                      }

                  }, 2000);


                  $rootScope.$on('pictures-failed',function(event, args){
                      console.log('pics failed');
                      $scope.refresh(false);

                  });



                });


      }, function fail(res){
              console.log(res);
      }).finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });


    };

    $scope.doRefresh();


    $scope.voteAnim = 0;
    $scope.vote = function(id){
      $scope.voteAnim = id;
    };

    //----------------------------------------------------------//



    var template = '<ion-popover-view style="height:180px"><ion-content><div class="list"><a class="item"><i class="icon ion-social-facebook"> Facebook</i></a><a class="item"><i class="icon ion-social-twitter"> Twitter</i></a><a class="item"><img src="../img/vklogo.svg" style="height:20px"> Vkontakte</a></div></ion-content></ion-popover-view>';




    /*
    <ion-popover-view style="height:125px"><ion-content><div class="list"><a class="item">Camera</a><a class="item" ng-click="closePopover($event)" ui-sref="app.photoup()" >Gallery</a></div></ion-content></ion-popover-view>*/

    $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
    });

    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };

    $scope.closePopover = function($event) {
        $scope.popover.hide($event);
    };


    //$scope.modal_n;
    $ionicModal.fromTemplateUrl('templates/comment.html',{
        scope: $scope
    }).then(function(modal){
        $scope.modal = modal;
    });

    $scope.openComment = function(obj) {
      $scope.modal.show();
      $rootScope.$broadcast('comment-open');
      console.log(obj);
      $scope.com = obj;
    };

    $scope.closeComment = function() {
      $scope.modal.hide();
      $rootScope.$broadcast('comment-closed');
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    //--------------------------- <comments> ---------------------------//
    $scope.Check_1 = function(id){
        return $scope.myId == id;
    };

    $scope.message = {"data": ""};
    $scope.loading = false;

    $scope.addComment = function(picId, token){
        if ($scope.message.data !== ""){
          $scope.loading = true;

          CommentFactory.commentPicture($scope.myUser, picId, $scope.message.data, token)
              .then(function successCallback(res){
                  var id = arrayObjectIndexOf($scope.pics, picId);
                  $scope.pics[id].comments = CommentFactory.getNewComment($scope.pics[id].comments);
                  $scope.loading = false;
                });


          $scope.message.data = "";
        }


    };

    $scope.deleteComment = function(picId, commentId, token){

          picsFactory.deleteComment(commentId, token)
            .then(function successCallback(res){
                var i = arrayObjectIndexOf($scope.pics, picId);
                $scope.pics[i].comments.splice((arrayObjectIndexOf($scope.pics[i].comments, commentId)),1);
            });
    };
    //--------------------------- </comments> ---------------------------//


      //------------------ picture rating -------------------------------//
      /*
        inherit those functions from AppCtrl to make this code smaller
      */

      var arrayObjectIndexOf = function(arr, obj){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].id  === obj){
                return i;
              }
        };
            return null;
      };

      var arrayObjectIndexOfRatings = function(arr, obj){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].raterId  === obj){
                return i;
              }
        };
            return null;
      };


      $scope.rateAnimation = function(photoId){

          $scope.animIN = photoId;

          $timeout(function anim(){
              $scope.animIN = null;
          }, 500);

      };

      $scope.unrate = function(picId, token){
          picsFactory.unratePicture(picId, token);
      };

      $scope.dejaAime = function(id){
        var i = arrayObjectIndexOf($scope.pics, id);
        if(i !== null){
            var k = arrayObjectIndexOfRatings($scope.pics[i].ratings, $scope.myUserId);
            if(k !== null){
              return $scope.pics[i].ratings[k].starsCount;
            }
        }
        return null;

      };
      $scope.ratePicture = function(picId, rating, token){

        var newRating = {
            raterId: $scope.myUserId,
            ratingTime: new Date(),
            starsCount: rating
        };

        if($scope.dejaAime(picId)){
            //we should be able to unrate this pic
            console.log("we should be able to unrate this pic");


        } else {
            picsFactory.ratePicture(picId, rating, token);
            $rootScope.$on('rate-success', function(event, args){
                $scope.pics[arrayObjectIndexOf($scope.pics, picId)].ratings.push(newRating);
                $scope.pics[arrayObjectIndexOf($scope.pics, picId)].starsCount += rating;
                console.log("rate sucess");
            });
            $scope.rateAnimation(picId);
        }




      };

      //-----------------------------------------------------------------//






}])


.controller('ProfileCtrl',['$scope', 'mainFactory', 'usersFactory','$stateParams', '$ionicHistory',
 '$ionicModal','AuthService','$localStorage','picsFactory','$state','$location', '$anchorScroll','$ionicScrollDelegate','$timeout',
 '$rootScope','moment', 'FollowerService','$filter','$ionicLoading','CommentFactory'
  ,function($scope, mainFactory, usersFactory, $stateParams, $ionicHistory, $ionicModal, AuthService, $localStorage, picsFactory,
     $state, $location, $anchorScroll, $ionicScrollDelegate, $timeout, $rootScope, moment, FollowerService, $filter, $ionicLoading, CommentFactory){

    $scope.tab = 1;
    console.log('stateParams: ');
    console.log($stateParams);
    var pags_number = 1;


    //-------------- getting my user data ----------------------//
    $scope.myUsername = $localStorage.getObject('userName', null);
    $scope.myToken =  $localStorage.getObject('userToken', null);
    $scope.myId = $localStorage.getObject('userid', null);
    $scope.pics = null;
    $scope.refreshing = true;
    $scope.picsAmount = null;

    $scope.animIN = null;
    $scope.animOUT = false;


    $scope.publicPics = null;
    $scope.mutualFollowerPics = null;
    $scope.competitionPics = null;

    $scope.$on('$ionicView.enter', function(e) {
        $scope.pics = null;
        pags_number = 1;
       $scope.doRefresh(false);
    });

    $scope.doRefresh = function(loadMore){

      if(loadMore){
          console.log('infinte scroll triggered');
          pags_number += 1;
      }

      usersFactory.searchUser(null, $scope.myToken, $stateParams.id)
          .then(function success(res){
            //$scope.user = ;
            $scope.user = picsFactory.replacePic_4(usersFactory.getUser());
            console.log('my user is');
            console.log($scope.user);

            usersFactory.getUserData($scope.myToken);

            usersFactory.searchUser(null, $scope.myToken, $scope.myId)
              .then(function successCallback(res){
                  $scope.me = usersFactory.getUser();
                  $scope.me = picsFactory.replacePic_4($scope.me);
              });

            $scope.followers = null;
            $scope.following = null;
            FollowerService.loadFollowers($scope.user.userId, $scope.myToken, $scope.user.userId === $scope.myId)
              .then(function successCallback(res){
                    $scope.followers = FollowerService.getFollowers();
                    $scope.following = FollowerService.getFollowing();
                    $scope.followers = picsFactory.replacePic_3($scope.followers);
                    $scope.following = picsFactory.replacePic_3($scope.following);
                    console.log($scope.followers);
                    console.log($scope.following);
                    $scope.checkUser($scope.user.userId);

              });



            picsFactory.getUserPictures($scope.user.userId, pags_number, $scope.myToken)
              .then(function successCallback(res){


                  /*$scope.publicPics = {
                       amount:0,
                       pics: []
                  };
                  $scope.mutualFollowerPics = {
                        amount:0,
                        pics:[]
                  };
                  $scope.competitionPics = {
                        amount:0,
                        pics:[]
                  };
*/

                    $scope.picsAmount = picsFactory.getPicsAmount();

                    //this adds, one-by-one, new pictures to the user's arrays of pics
                    if(pags_number == 1){
                        $scope.mutualFollowerPics = picsFactory.getMutualFollowerPictures();
                        $scope.publicPics = picsFactory.getPublicUserPictures();
                        $scope.competitionPics = picsFactory.getUserCompetitionPics();

                        //for the love of god, plz change this bit of code later:
                        $scope.pics = picsFactory.getAllpictures();
                    } else if(pags_number > 1){
                        var mutPic = picsFactory.getMutualFollowerPictures();
                        var pubPic = picsFactory.getPublicUserPictures();
                        var comPic = picsFactory.getUserCompetitionPics();

                        //for the love of god, plz change this bit of code later:
                        var newPics = picsFactory.getAllpictures();

                        for (var i = 0; i < mutPic.pics.length-1; i++){
                          $scope.mutualFollowerPics.pics.push(mutPic.pics[i]);
                          $scope.mutualFollowerPics.amount = mutPic.amount;
                        }

                        for (var i = 0; i < pubPic.pics.length-1; i++){
                          $scope.publicPics.pics.push(pubPic.pics[i]);
                          $scope.publicPics.amount = pubPic.amount;
                        }

                        for (var i = 0; i < comPic.pics.length-1; i++){
                          $scope.competitionPics.pics.push(comPic.pics[i]);
                          $scope.competitionPics.amount = comPic.amount;
                        }

                        for (var i = 0; i < newPics.length-1; i++){
                          $scope.pics.push(newPics[i]);
                        }

                    }


                    console.log("pics: ");
                    console.log($scope.pics);
                    $ionicLoading.hide();

                    $timeout(function(){

                        //to avoid jamming the phone in cases of error
                        if($scope.pics.length > 0){

                          $scope.refreshing = false;
                        } else {pags_number = 1}

                    }, 1000);
                    //$scope.time = pics[0].uploaded;
                    //momentFromNow($scope.pics[0].uploaded);
              });

      }).finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
       //$scope.$broadcast('scroll.infiniteScrollComplete');
     });



    };


    $scope.select = function(setTab){
        $scope.tab = setTab;

    };
    //----------- this for the second set of tabs------------//
    $scope.tab_2nd = 1;
    $scope.select_2nd = function(setTab){
        console.log('select_2nd tab:' + setTab);
        $scope.tab_2nd = setTab;
    };

    $scope.isSelected_2nd = function(checkTab){
        return ($scope.tab_2nd === checkTab);
    };
    //-----------------------//

    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };


    //------------------ picture rating -------------------------------//
    var arrayObjectIndexOf = function(arr, obj){
      for(var i = 0; i < arr.length; i++){
          if(arr[i].id  === obj){
              return i;
            }
      };
          return null;
    };

    var arrayObjectIndexOfRatings = function(arr, obj){
      for(var i = 0; i < arr.length; i++){
          if(arr[i].raterId  === obj){
              return i;
            }
      };
          return null;
    };


    $scope.rateAnimation = function(photoId){

        $scope.animIN = photoId;

        $timeout(function anim(){
            $scope.animIN = null;
        }, 500);

    };

    $scope.dejaAime = function(id){
      var i = arrayObjectIndexOf($scope.pics, id);
      if(i){
          var k = arrayObjectIndexOfRatings($scope.pics[i].ratings, $scope.myId);
          if(k) return true;
      }
      return false;

    };

    $scope.ratePicture = function(picId, rating, token){

      var newRating = {
          raterId: $scope.myId,
          ratingTime: new Date(),
          starsCount: rating
      };

      if($scope.dejaAime(picId)){
          //we should be able to unrate this pic
          console.log("we should be able to unrate this pic");
      } else {
          picsFactory.ratePicture(picId, rating, token);
          $rootScope.$on('rate-success', function(event, args){
              $scope.pics[arrayObjectIndexOf($scope.pics, picId)].ratings.push(newRating);
              $scope.pics[arrayObjectIndexOf($scope.pics, picId)].starsCount += rating;
              console.log("rate sucess");
          });
          $scope.rateAnimation(picId);
      }




    };

    //-----------------------------------------------------------------//


    $scope.isFollower = function(userId){
      if($scope.followers){
        var mineFollowers = FollowerService.getMyFriends();
        for (var i = mineFollowers.followerList.length-1; i >= 0 ; i--){
            if (userId === mineFollowers.followerList[i].id){
                return true;
              }
        }
      }
      return false;
    };

    $scope.isFollowing = function(userId){
      if($scope.following){
        var mineFollowing = FollowerService.getMyFriends();
        for (var i = mineFollowing.followingList.length-1; i >= 0; i--){
            if(userId === mineFollowing.followingList[i].id){
                return true;
              }
        }
      }
      return false;

    };

    $scope.btnClass = {
        btn: null,
        userStats: null,
        info: null
    };
    $scope.checkUser = function(userId){
        var user =  null;


        if($scope.user){
            if($scope.user.userId === $scope.myId){
                user = "user";
                $scope.btnClass.btn = "icon ion-gear-a";
                $scope.btnClass.info = user;

                return user;
            }
            else if(!$scope.isFollower(userId) && !$scope.isFollowing(userId)){
                user = "Nfollower";
                $scope.btnClass.btn =  "button button-small button-stable";
                $scope.btnClass.userStats = "Follow";
                $scope.btnClass.info = user;

                return user;
            }
            else if($scope.isFollower(userId) && !$scope.isFollowing(userId)){
                user = "follower";
                $scope.btnClass.btn =  "button button-small button-stable";
                $scope.btnClass.userStats = "Follow";
                $scope.btnClass.info =  user;

                return user;
            }
            else if(!$scope.isFollower(userId) && $scope.isFollowing(userId)){
                user = "following";
                $scope.btnClass.btn =  "button button-small button-positive";
                $scope.btnClass.userStats = "Following";
                $scope.btnClass.info = user;

                return user;
            }
            else if($scope.isFollower(userId) && $scope.isFollowing(userId)){
                user = "Mfollower";
                $scope.btnClass.btn =  "button button-small button-balanced";
                $scope.btnClass.userStats = "Mutual";
                $scope.btnClass.info = user;
                return user;
            } else return null;
        }

    };

    $scope.handleUser = function(user){
        if (user === "Mfollower" || user === "following"){
          $scope.unfollow($scope.user.userId, $scope.myToken);
        }
        else if (user === "follower" || user === "Nfollower"){
          $scope.follow($scope.user.userId, $scope.myToken);
        }
        else if (user === "user"){
          $state.go('app.edit');
          $scope.doRefresh();

        }

    };


    //$scope.message = { text: 'hello world!', time: new Date() };

    $scope.switchToFeed = function(anchor, usr){
        $state.go('app.feedView', {id:usr});
        $rootScope.$on('pictures-loaded', function(event, args){

          $timeout(function(){
            console.log("anchoring: " + anchor);
            $location.hash(anchor);
            var handle = $ionicScrollDelegate.$getByHandle('content');
            handle.anchorScroll();
          }, 300);

        });





    };



    $scope.follow = function(usrId, token){
        // HERE usrId IS THE USER WE WANT TO FOLLOW/UNFOLLOW
        console.log("following");
        FollowerService.follow(usrId, token)
          .then(function successCallback(response){
              FollowerService.loadFollowers($scope.myId, $scope.myToken, true)
                .then(function successCallback(response){
                    $scope.doRefresh();
                });
          });

    };

    $scope.unfollow = function(usrId, token){
        // HERE usrId IS THE USER WE WANT TO FOLLOW/UNFOLLOW
        console.log("unfollowing");
        FollowerService.unfollow(usrId, token)
          .then(function successCallback(response){
            FollowerService.loadFollowers($scope.myId, $scope.myToken, true)
              .then(function successCallback(response){
                  $scope.doRefresh();
              });

          });

    };



    $scope.myGoBack = function(){
        $ionicHistory.goBack();
    };

    //$scope.modal_n;
    $ionicModal.fromTemplateUrl('templates/comment.html',{
        scope: $scope
    }).then(function(modal){
        $scope.modal = modal;
    });

    $scope.openComment = function(obj) {
      $scope.modal.show();
      $rootScope.$broadcast('comment-open');
      console.log(obj);
      $scope.com = obj;
    };

    $scope.closeComment = function() {
      $scope.modal.hide();
      $rootScope.$broadcast('comment-closed');
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    //--------------------------- <comments> ---------------------------//

    $scope.Check_1 = function(id){
        return $scope.myId == id;
    };

    $scope.message = {"data": ""};
    $scope.loading = false;

    $scope.addComment = function(picId, token){
        if ($scope.message.data !== ""){
          $scope.loading = true;

          CommentFactory.commentPicture($scope.me, picId, $scope.message.data, token)
              .then(function successCallback(res){
                  var id = arrayObjectIndexOf($scope.pics, picId);
                  $scope.pics[id].comments = CommentFactory.getNewComment($scope.pics[id].comments);
                  $scope.loading = false;
                });


          $scope.message.data = "";
        }


    };

    $scope.deleteComment = function(picId, commentId, token){

          picsFactory.deleteComment(commentId, token)
            .then(function successCallback(res){
                var i = arrayObjectIndexOf($scope.pics, picId);
                $scope.pics[i].comments.splice(arrayObjectIndexOf($scope.pics[i].comments, commentId),1);
            });
    };
    //--------------------------- </comments> ---------------------------//

}])

.controller('CompetitionController',['$scope','competitionFactory','$localStorage',
'$rootScope','$anchorScroll','$ionicScrollDelegate','$timeout','$state','$location',
'$ionicModal','$ionicLoading','picsFactory','CommentFactory','usersFactory',
 function($scope, competitionFactory, $localStorage, $rootScope, $anchorScroll,
   $ionicScrollDelegate,$timeout, $state, $location, $ionicModal, $ionicLoading, picsFactory,
   CommentFactory, usersFactory){

     $scope.$on('$ionicView.enter', function(e) {
        $scope.doRefresh(false);
     });


    $scope.pics = [];
    $scope.tab = 1;
    $scope.myToken =  $localStorage.getObject('userToken', null);
    $scope.myId = $localStorage.getObject('userid', null);
    var pg_number = 1;
    $scope.refreshing = true;

    $scope.doRefresh = function(loadMore){
      $scope.refreshing = true;
      $ionicLoading.show({
                  template: '<p>Loading...</p><ion-spinner></ion-spinner>'
              });

      if(loadMore){
          console.log('infinite scroll triggered');
          pg_number += 1;
      }

      competitionFactory.getCompetitionPics(pg_number, $scope.myToken)
        .then(function successCallback(res){
            $ionicLoading.hide();
            //$scope.pics = competitionFactory.getPics();
            var newpg = competitionFactory.getPics();
            newpg = picsFactory.replacePic_2(newpg);
            for(var i = newpg.length-1; i >= 0; i--){
              $scope.pics.push(newpg[i])

            }


            $timeout(function(){

                //to avoid jamming the phone in cases of error
                if($scope.pics.length > 0){

                  $scope.refreshing = false;
                } else {pg_number = 1}

            }, 3000);

            usersFactory.searchUser(null, $scope.myToken, $scope.myId)
              .then(function successCallback(res){
                  $scope.me = usersFactory.getUser();
              });


        }).finally(function() {
         // Stop the ion-refresher from spinning
         $scope.$broadcast('scroll.refreshComplete');
       });
    };



    $scope.switchToFeed = function(anchor){
        $state.go('app.competitionFeed');
        $rootScope.$on('pictures-loaded', function(event, args){

          $timeout(function(){
            console.log("anchoring: " + anchor);
            $location.hash(anchor);
            var handle = $ionicScrollDelegate.$getByHandle('content');
            handle.anchorScroll();
          }, 300);

        });
      };

      //TODO: implement commeting on competition service
      $ionicModal.fromTemplateUrl('templates/comment.html',{
          scope: $scope
      }).then(function(modal){
          $scope.modal = modal;
      });

      $scope.openComment = function(obj) {
        $scope.modal.show();
        $rootScope.$broadcast('comment-open');
        console.log(obj);
        $scope.com = obj;
      };

      $scope.closeComment = function() {
        $scope.modal.hide();
        $rootScope.$broadcast('comment-closed');
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });

      //--------------------------- <rate> --------------------------------//
      var arrayObjectIndexOf = function(arr, obj){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].id === obj){
                return i;
              }
        };
            return null;
      };

      var arrayObjectIndexOfRatings = function(arr, obj){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].raterId === obj){
                return i;
              }
        };
            return null;
      };

      $scope.animIN = null;
      $scope.rateAnimation = function(photoId){

          $scope.animIN = photoId;

          $timeout(function anim(){
              $scope.animIN = null;
          }, 500);

      };

      $scope.dejaAime = function(id){
        var i = arrayObjectIndexOf($scope.pics, id);
        if(i !== null){
            var k = arrayObjectIndexOfRatings($scope.pics[i].ratings, $scope.myId);
            if(k !== null){
              return $scope.pics[i].ratings[k].starsCount;
            }
        }
        return null;

      };


      $scope.ratePicture = function(picId, rating, token){

        var newRating = {
            raterId: $scope.myId,
            ratingTime: new Date(),
            starsCount: rating
        };

        if($scope.dejaAime(picId)){
            //we should be able to unrate this pic
            console.log("we should be able to unrate this pic");
        } else {
            picsFactory.ratePicture(picId, rating, token);
            $rootScope.$on('rate-success', function(event, args){
                $scope.pics[arrayObjectIndexOf($scope.pics, picId)].ratings.push(newRating);
                $scope.pics[arrayObjectIndexOf($scope.pics, picId)].starsCount += rating;
                console.log("rate sucess");
            });
            $scope.rateAnimation(picId);
        }




      };
      //------------------------- </rate>-----------------------------//
      //--------------------------<comments>-------------------------//
      $scope.Check_1 = function(id){
          return $scope.myId == id;
      };

      $scope.message = {"data": ""};
      $scope.loading = false;

      $scope.addComment = function(picId, token){
          if ($scope.message.data !== ""){
            $scope.loading = true;

            CommentFactory.commentPicture($scope.me, picId, $scope.message.data, token)
                .then(function successCallback(res){
                    var id = arrayObjectIndexOf($scope.pics, picId);
                    $scope.pics[id].comments = CommentFactory.getNewComment($scope.pics[id].comments);
                    $scope.loading = false;
                  });


            $scope.message.data = "";
          }


      };

      $scope.deleteComment = function(picId, commentId, token){

            picsFactory.deleteComment(commentId, token)
              .then(function successCallback(res){
                  var i = arrayObjectIndexOf($scope.pics, picId);
                  $scope.pics[i].comments.splice((arrayObjectIndexOf($scope.pics[i].comments, commentId)),1);
              });
      };
      //--------------------------</comments>-------------------------//





    $scope.select = function(setTab){
        $scope.tab = setTab;
    };

    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };




}])

.controller('PictureUploadCtrl',['$scope','$ionicPlatform','$cordovaImagePicker','$cordovaCamera','PictureService', '$stateParams', '$state', function($scope, $ionicPlatform, $cordovaImagePicker, $cordovaCamera, PictureService, $stateParams, $state){



    $ionicPlatform.ready(function(){

        $scope.image = PictureService.takePicture();

    });


}])

.controller('SearchCtrl',['$scope','usersFactory','$ionicModal',
'$localStorage','picsFactory','$rootScope','$anchorScroll','$ionicScrollDelegate',
'$timeout','$state','$location','$ionicModal','$ionicLoading','CommentFactory','HashtagService','$stateParams',
 function($scope, usersFactory, $ionicModal, $localStorage,
    picsFactory, $rootScope, $anchorScroll,
    $ionicScrollDelegate, $timeout, $state, $location, $ionicModal, $ionicLoading,
    CommentFactory, HashtagService, $stateParams){


    $scope.$state = $state;
    $scope.searchBox = null;
    $scope.tab = 1;
    $scope.searchText = "Search users here";
    $scope.myToken =  $localStorage.getObject('userToken', null);
    var myUsername = $localStorage.getObject('userName', null);
    $scope.myId = $localStorage.getObject('userid', null);
    $scope.users = null;
    $scope.searching = false;
    $scope.pics = [];
    var pags_number = 1;
    $scope.user = null;
    $scope.refreshing = true;


    $scope.$on('$ionicView.enter', function(e) {
       $scope.pics = [];
       pags_number = 1;
       $scope.refresh(false);

    });



    $scope.changeMe = function(){
        $scope.tab = 2;
        console.log("changed");
        $scope.searching = true;

        if($scope.searchBox !== null){
          var arr = Array.from($scope.searchBox);
          if(arr[0] == '#'){
            arr.splice(0,1);
            //in case we're looking for hashtags

            console.log('looking for hashtags with: ' + arr.join(""));
            HashtagService.searchHashtags(arr.join(""), $scope.myToken)
              .then(function successCallback(res){
                  $scope.hashtags = HashtagService.getSearchedHash();
                  console.log($scope.hashtags);
              });
          }
          else{
            //in case we're looking for people
            usersFactory.findUserByName($scope.searchBox, $scope.myToken)
              .then(function successCallback(res){
                    $scope.users = usersFactory.getUserSearchList();
                    $scope.users = picsFactory.replacePic_1($scope.users); //to replace empty profile pics for default thumbs
                    console.log($scope.users);
                    $scope.searching = false;
              }, function errorCallback(res){
                    $scope.searching = false;
                    $scope.searchText = "no results found";
              });

          }


        };

    };


    $scope.HashPics = [];
    $scope.goToHash = function(hashtag){
      var arr = Array.from(hashtag);
      arr.splice(0,1);

      $state.go('app.hashtagFeed', {id:(arr.join(""))});



    };
    /*
    if($scope.$state.current.name === 'app.picture'){
       console.log('we are in app.picture');
        picsFactory.getSinglePic($stateParams.id, myUserToken)
          .then(function successCallback(res){
              $scope.photo = picsFactory.returnSinglePic();


          });
    }*/


    $scope.refresh = function(loadMore){
      $scope.refreshing = true;


      if(loadMore){
          console.log('infinite scroll triggered');
          pags_number+=1;
          console.log('infinte scroll invoked, pgs:' + pags_number);
      } else{
        $ionicLoading.show({
                    template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                });
      }
      if($scope.$state.current.name === 'app.hashtagFeed'){
          HashtagService.LoadHashResults($stateParams.id, $scope.myToken)
            .then(function successCallback(res){
              console.log($stateParams);
                $ionicLoading.hide();
                $scope.HashPics = HashtagService.getSearchedHash();
                $scope.HashPics = picsFactory.replacePic_2($scope.HashPics);

                console.log($scope.HashPics);
        });
      } else{
        picsFactory.getPublicPictures(pags_number, $scope.myToken)
          .then(function successCallback(res){

              $ionicLoading.hide();

              var newPics = picsFactory.getPublic();
              console.log(newPics);
              newPics = picsFactory.replacePic_2(newPics);

              for(var i = 0; i < newPics.length; i++){

                $scope.pics.push(newPics[i]);
              }

              $timeout(function(){

                if($scope.pics.length > 0){
                  console.log('infinte scroll invoked, pgs:' + pags_number);
                  $scope.refreshing = false;
                }

              }, 3000);

          }).finally(function() {
           // Stop the ion-refresher from spinning
           $scope.$broadcast('scroll.refreshComplete');
         });
      }

       usersFactory.searchUser(null, $scope.myToken, $scope.myId)
           .then(function success(res){
              $scope.user = usersFactory.getUser();
           });

    };




    $scope.switchToFeed = function(anchor){
        $state.go('app.recentFeed');
        $rootScope.$on('pictures-loaded', function(event, args){

          $timeout(function(){
            console.log("anchoring: " + anchor);
            $location.hash(anchor);
            var handle = $ionicScrollDelegate.$getByHandle('content');
            handle.anchorScroll();
            anchor = null;
          }, 300);

        });
      };

      //$scope.modal_n;
      $ionicModal.fromTemplateUrl('templates/comment.html',{
          scope: $scope
      }).then(function(modal){
          $scope.modal = modal;
      });

      $scope.openComment = function(obj) {
        $scope.modal.show();
        $rootScope.$broadcast('comment-open');
        console.log(obj);
        $scope.com = obj;
      };

      $scope.closeComment = function() {
        $scope.modal.hide();
        $rootScope.$broadcast('comment-closed');
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });


      //--------------------------- <comments> ---------------------------//
      var arrayObjectIndexOf = function(arr, obj){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].id === obj){
                return i;
              }
        };
            return null;
      };

      $scope.Check_1 = function(id){
          return $scope.myId == id;
      };

      $scope.message = {"data": ""};
      $scope.loading = false;

      $scope.addComment = function(picId, token){
          if ($scope.message.data !== ""){
            $scope.loading = true;

            CommentFactory.commentPicture($scope.user, picId, $scope.message.data, token)
                .then(function successCallback(res){
                    var id = arrayObjectIndexOf($scope.pics, picId);
                    $scope.pics[id].comments = CommentFactory.getNewComment($scope.pics[id].comments);
                    $scope.loading = false;
                  });


            $scope.message.data = "";
          }


      };


      $scope.deleteComment = function(picId, commentId, token){

        picsFactory.deleteComment(commentId, token)
          .then(function successCallback(res){
              var i = arrayObjectIndexOf($scope.pics, picId);
              $scope.pics[i].comments.splice(arrayObjectIndexOf($scope.pics[i].comments, commentId),1);
          });
      };
      //--------------------------- </comments> ---------------------------//

      //--------------------------- <rate> --------------------------------//
      var arrayObjectIndexOfRatings = function(arr, obj){
        for(var i = 0; i < arr.length; i++){
            if(arr[i].raterId === obj){
                return i;
              }
        };
            return null;
      };

      $scope.animIN = null;
      $scope.rateAnimation = function(photoId){

          $scope.animIN = photoId;

          $timeout(function anim(){
              $scope.animIN = null;
          }, 500);

      };

      $scope.dejaAime = function(id){
        var i = arrayObjectIndexOf($scope.pics, id);
        if(i !== null){
            var k = arrayObjectIndexOfRatings($scope.pics[i].ratings, $scope.myId);
            if(k !== null){
              return $scope.pics[i].ratings[k].starsCount;
            }
        }
        return null;

      };

      $scope.ratePicture = function(picId, rating, token){

        var newRating = {
            raterId: $scope.myId,
            ratingTime: new Date(),
            starsCount: rating
        };

        if($scope.dejaAime(picId)){
            //we should be able to unrate this pic
            console.log("we should be able to unrate this pic");
        } else {
            picsFactory.ratePicture(picId, rating, token);
            $rootScope.$on('rate-success', function(event, args){
                $scope.pics[arrayObjectIndexOf($scope.pics, picId)].ratings.push(newRating);
                $scope.pics[arrayObjectIndexOf($scope.pics, picId)].starsCount += rating;
                console.log("rate sucess");
            });
            $scope.rateAnimation(picId);
        }




      };
      //------------------------- </rate>-----------------------------//




    $scope.select = function(setTab){
        $scope.tab = setTab;
    };

    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };



}])




.controller('FooterCtrl',['$scope','$ionicModal','$ionicPopover','AuthService','$state','usersFactory',
'NotificationService','$localStorage','$rootScope','$ionicHistory','$cordovaCamera','$ionicPlatform',
'$cordovaImagePicker', '$ionicPopup','UploadFactory','$timeout','picsFactory', '$stateParams','CommentFactory',
 '$cordovaLocalNotification'
,function($scope,$ionicModal,$ionicPopover, AuthService, $state, usersFactory,
  NotificationService, $localStorage, $rootScope, $ionicHistory, $cordovaCamera, $ionicPlatform,
   $cordovaImagePicker, $ionicPopup, UploadFactory, $timeout, picsFactory, $stateParams, CommentFactory,
  $cordovaLocalNotification){

    $scope.$state = $state;
    console.log($scope.$state.current.name);
    var history = $ionicHistory.viewHistory();
    $scope.showFloatingMenu = true;

    console.log(history.currentView);
    console.log(history.backView.stateId);
    $rootScope.$broadcast('state-changed',history.backView.stateId);
    //$state.go($state.current,{}, {reload:true});

    $rootScope.$on('comment-open', function(event, args){
        $scope.showFloatingMenu = false;
    });

    $rootScope.$on('comment-closed', function(event, args){
        $scope.showFloatingMenu = true  ;
    });



    var myUserToken = $localStorage.getObject('userToken', null);
    var myUsername = $localStorage.getObject('userName', null);
    $scope.myId = $localStorage.getObject('userid', null);
    $scope.me = $localStorage.getObject('userData', null);



    $scope.activityNotifications = [];
    $scope.followerNotifications = [];
    $scope.notificationUsers = [];
    $scope.loading = true;
    $scope.unseen = {
        amount:0,
        activity:0,
        follower:0,
        activityIndexes:[],
        followerIndexes:[]
    };

    $scope.updateNotifs = function(){


      console.log($scope.myId);
      NotificationService.getNotifications($scope.myId, myUserToken)
        .then(function successCallback(res){
            $scope.unseen = {
                amount:0,
                activity:0,
                follower:0,
                activityIndexes:[],
                followerIndexes:[]
            };

            $scope.activityNotifications = NotificationService.getNotes().activityNotifications;
            $scope.followerNotifications = NotificationService.getNotes().followerNotifications;

            for(var i = $scope.activityNotifications.length-1; i >= 0; i--){
                if($scope.activityNotifications[i].seen === false){
                    $scope.unseen.amount += 1;
                    $scope.unseen.activity += 1;
                    $scope.unseen.activityIndexes.push($scope.activityNotifications[i].id);
                }
            }

            for(var i = $scope.followerNotifications.length-1; i >= 0; i--){
                if($scope.followerNotifications[i].seen === false){
                    $scope.unseen.amount += 1;
                    $scope.unseen.follower += 1;
                    $scope.unseen.followerIndexes.push($scope.followerNotifications[i].followerNotificationId);
                }
            }
            //console.log($scope.unseen);
            $scope.loading = false;


        });
    };


    $scope.getNotifs = function(){
      $scope.myId = $localStorage.getObject('userid', null);
      $scope.unseen.amount = 0;
      $scope.unseen.activity = 0;
      $scope.unseen.follower = 0;
      $scope.unseen.activityIndexes = [];
      $scope.unseen.followerIndexes = [];


      $scope.loading = true;
      if($scope.$state.current.name === 'app.picture'){
         console.log('we are in app.picture');
          picsFactory.getSinglePic($stateParams.id, myUserToken)
            .then(function successCallback(res){
                $scope.photo = picsFactory.returnSinglePic();


            });
      }
      else {

          $scope.updateNotifs();

      }


    };

    $scope.getNotifs();



    $scope.seePhotoInNewPage = function(picId, description){
        var comment_1 = "commented on a picture you commented on";
        var comment_2 = "tagged you in a comment";

        picsFactory.getSinglePic(picId, myUserToken)
          .then(function successCallback(res){

            if(description === comment_1 || description === comment_2){
                $state.go('app.picture', {id:picId, obj: description});
                $scope.closeModal();
            } else {
              $state.go('app.picture', {id:picId});
              $scope.closeModal();
            }




          })
        //$state.go('app.picture');


    };

    $scope.tab = 1;

    $scope.select = function(setTab){
        $scope.tab = setTab;

        //to set notifications as seen as soon as we get to see them
        if($scope.unseen.amount > 0){
          if($scope.tab == 1){
              if($scope.unseen.activity > 0){
                  NotificationService.activityNotifsSeen(myUserToken);
                  $scope.updateNotifs();

              }
          }
          else if($scope.tab == 2){
              if($scope.unseen.follower > 0){
                  NotificationService.userNotifsSeen(myUserToken);
                  $scope.updateNotifs();
              }
          }
        }


    };

    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };




    $ionicModal.fromTemplateUrl('templates/notifications.html',{
        scope: $scope
    }).then(function(modal){
        $scope.notificationsModal = modal;
    });

    $scope.openModal = function(){
        $rootScope.$broadcast('comment-open');
        $scope.updateNotifs();
        $scope.notificationsModal.show();
    };

    $scope.closeModal = function() {
        $rootScope.$broadcast('comment-closed');
        $scope.notificationsModal.hide();
    }


    $scope.animIN = null;
    $scope.animOUT = false;


    //------------------ picture rating -------------------------------//
    var arrayObjectIndexOf = function(arr, obj){
      for(var i = 0; i < arr.length; i++){
          if(arr[i].id  === obj){
              return i;
            }
      };
          return null;
    };

    var arrayObjectIndexOfRatings = function(arr, obj){
      for(var i = 0; i < arr.length; i++){
          if(arr[i].raterId  === obj){
              return i;
            }
      };
          return null;
    };


    $scope.rateAnimation = function(photoId){

        $scope.animIN = photoId;

        $timeout(function anim(){
            $scope.animIN = null;
        }, 500);

    };

    $scope.dejaAime = function(id){
      if($scope.photo){
        var k = arrayObjectIndexOfRatings($scope.photo.ratings, $scope.myId);
        if(k !== null){
          return $scope.photo.ratings[k].starsCount;
        }
        return null;
      }


    };

    $scope.ratePicture = function(picId, rating, myUserToken){

      var newRating = {
          raterId: $scope.myId,
          ratingTime: new Date(),
          starsCount: rating
      };

      //ATTENTION: custom made rating for this page
      if($scope.dejaAime(picId)){
          //we should be able to unrate this pic
          console.log("we should be able to unrate this pic");
      } else {
          picsFactory.ratePicture(picId, rating, myUserToken);
          $rootScope.$on('rate-success', function(event, args){
              $scope.photo.ratings.push(newRating);
              $scope.photo.starsCount += rating;
              console.log("rate sucess");
          });
          $scope.rateAnimation(picId);
      }




    };



    //-----------------------------------------------------------------//
    //$scope.modal_n;
    $ionicModal.fromTemplateUrl('templates/comment.html',{
        scope: $scope
    }).then(function(modal){
        $scope.modal = modal;
    });

    $scope.openComment = function(obj) {
      commentModalOpen = true;
      $scope.modal.show();
      $rootScope.$broadcast('comment-open');
      console.log(obj);
      $scope.com = obj;
    };

    $scope.closeComment = function() {
      $scope.modal.hide();
      commentModalOpen = false;
      $rootScope.$broadcast('comment-closed');
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });


    //--------------------------- <comments> ---------------------------//

    $scope.Check_1 = function(id){
        return $scope.myId == id;
    };

    $scope.message = {"data": ""};
    $scope.loading = false;

    $scope.myToken = $localStorage.getObject('userToken', null);
    $scope.addComment = function(picId, token){
        if ($scope.message.data !== ""){
          $scope.loading = true;

          CommentFactory.commentPicture($scope.me, picId, $scope.message.data, myUserToken)
              .then(function successCallback(res){
                  //var id = arrayObjectIndexOf($scope.pics, picId);
                  $scope.photo.comments = CommentFactory.getNewComment($scope.photo.comments);
                  $scope.loading = false;
                });


          $scope.message.data = "";
        }


    };

    $scope.deleteComment = function(picId, commentId, myUserToken){

          picsFactory.deleteComment(commentId, myUserToken)
            .then(function successCallback(res){
                //var i = arrayObjectIndexOf($scope.pics, picId);
                $scope.photo.comments.splice(arrayObjectIndexOf($scope.photo.comments, commentId),1);
            });
    };
    //--------------------------- </comments> ---------------------------//




    //----------------- picture upload ---------------------//
      $ionicModal.fromTemplateUrl('templates/photoup.html',{
          scope: $scope
      }).then(function(modal){
          $scope.pictureSetupModal = modal;
      });

      $scope.openPicSetup = function(){
          $scope.showFloatingMenu = false;
          $scope.pictureSetupModal.show();
      };

      $scope.closePicSetup = function(){
          $scope.pictureSetupModal.hide();
          $scope.showFloatingMenu = true;

      };

      $scope.imgSrc = null;

      // the following function must be commented for the app to work on browser
      /*
      $ionicPlatform.ready(function() {

          //-----------background operations----------//
          cordova.plugins.backgroundMode.enable();

          cordova.plugins.backgroundMode.onactivate = function(){

            cordova.plugins.backgroundMode.configure({
              silent: true
            });

              setTimeout(function () {
                // Modify the currently displayed notification
                $scope.updateNotifs();

                if($scope.unseen.amount > 0){
                    if($scope.unseen.activity > 0){

                      cordova.plugins.notification.local.schedule({
                        title: "Glostars",
                        message: $scope.activityNotifications[$scope.unseen.activityIndexes[0]].name + " " +  $scope.activityNotifications[$scope.unseen.activityIndexes[0]].description,
                        icon: $scope.activityNotifications[$scope.unseen.activityIndexes[0]].picUrl
                      });

                    }

                    else if($scope.unseen.follower > 0){
                      cordova.plugins.notification.local.schedule({
                        title: "Glostars",
                        message: $scope.followerNotifications[$scope.unseen.followerIndexes[0]].name + " " +  $scope.followerNotifications[$scope.unseen.followerIndexes[0]].description,
                        icon: $scope.followerNotifications[$scope.unseen.followerIndexes[0]].profilePicURL
                      });

                    }
                  }

              }, 5000);
            };
            //-----------background operations----------//

            var options = {
                quality: 90,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 1000,
                targetHeight: 1000,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
            $scope.takePicture = function() {
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    $scope.imgSrc = "data:image/jpeg;base64," + imageData;
                }, function(err) {
                    console.log(err);
                });
                if($scope.imgSrc !== null){
                  $scope.openPicSetup();
                }
                //$scope.registerform.show();
            };
            var pickoptions = {
                maximumImagesCount: 1,
                width: 100,
                height: 100,
                quality: 50
            };
            $scope.pickImage = function() {
              $cordovaIma};
};
gePicker.getPictures(pickoptions)
                .then(function (results) {
                    for (var i = 0; i < results.length; i++) {
                        console.log('Image URI: ' + results[i]);
                        $scope.imgSrc = results[0];
                    }
                }, function (error) {
                    // error getting photos
                });
                if($scope.imgSrc !== null){
                  $scope.openPicSetup();
                }
            };
        }); */
        /*
        $scope.pictureMode = function(){

            $scope.showFloatingMenu = false;
            var myPopup = $ionicPopup.show({
                template:'',
                title:'<b>Upload a picture</b>',
                subTitle:'Choose a source...',
                buttons:[
                  {text:'<p style="padding-top:1px"></p><p style="padding-left:5px">Camera </p>',
                    onTap:function cam() {
                        $scope.showFloatingMenu = true;
                        //$scope.openPicSetup();
                        $scope.takePicture();
                        myPopup.close();

                        }
                  },
                  {text:'<p style="padding-top:1px"></p><p>Album</p>',
                     onTap:function album() {
                        $scope.showFloatingMenu = true;
                        //$scope.openPicSetup();
                        $scope.pickImage();
                        myPopup.close();

                        }
                  }
                ]
            });
        };

        $scope.pictureData = {};
        $scope.postPicture = function(){
            $scope.pictureData.imgUri = $scope.imgSrc;

            if($scope.pictureData.imgUri !== null){
              UploadFactory.UploadPicture($scope.pictureData.description,
              $scope.pictureData.privacy === "competition",
              $scope.pictureData.privacy, $scope.pictureData.imgUri,
              myUserToken).then(function successCallback(res){
                //$scope.pictureData = null;
                //$scope.closePicSetup();
                //TODO: implement sharing
              });
              $scope.pictureData = null;
              $scope.imgSrc = null;
              $scope.closePicSetup();
            } else {
                $scope.closePicSetup();
            }
        };
        */
        //----------------- picture upload ---------------------//


}])




.filter('getById', function() {
  return function(input, id) {
    var i=0, len=input.length;
    for (; i<len; i++) {
      if (+input[i].id == +id) {
        return input[i];
      }
    }
    return null;
  }
});

;
