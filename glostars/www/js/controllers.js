angular.module('starter.controllers', ['ngResource'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService, usersFactory, $rootScope, $ionicPlatform,
   $cordovaCamera, NotificationService,  $rootScope) {

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



  //TODO: encrypt data
  //TODO: the swipe screen has three views now, handle them here
  $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      var auth = AuthService.login($scope.loginData);
      console.log(auth);




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
'$filter','ionicMaterialInk','$ionicSlideBoxDelegate', function($scope,$state,AuthService,$http,$resource,RegisterService,
   $q, $ionicLoading, $localStorage, $filter, ionicMaterialInk, $ionicSlideBoxDelegate){



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
    //TODO: encrypt data
    //TODO: the swipe screen has three views now, handle them here

    $scope.fastLogin = function() {

        //var date = new Date();
        //date = $filter('date')(date, "dd/MM/yyyy");
        //console.log(date);

       if(token !== null && username !== null){
           $state.go('app.home');
       }

    };

    $scope.doLogin = function(){


        AuthService.login($scope.loginData).then(function success(response){
            if(AuthService.isAuthenticated()){

                token = AuthService.getAuthentication();
                var username = AuthService.getUsername();

                $localStorage.storeObject('userToken', token);
                $localStorage.storeObject('userName', username);
                console.log('changing view');
                $state.go('app.home');

                var d = AuthService.getExpiryDate();
                console.log(d);

            }
        }, function failure(res){
             console.log('error');
        });

    };


    $scope.userinfo = {};

    $scope.createAcc = function(){
        console.log($scope.userinfo);

        RegisterService.createAccount($scope.userinfo.email, $scope.userinfo.email, $scope.userinfo.firstname, $scope.userinfo.bday.getFullYear(), $scope.userinfo.bday.getMonth()+1, $scope.userinfo.bday.getDate(), $scope.userinfo.sex, $scope.userinfo.lastname, $scope.userinfo.password).then(function success(response){

            $scope.loginData = {email: $scope.userinfo.email, password: $scope.userinfo.password};

            $scope.doLogin();

        }, function failure(res){

            console.log("user already exists");
        });

    };


    //------------------------- fb sign up --------------//
    //$scope.fbSign = RegisterService.facebookSignIn();


}])


.controller('SettingsCtrl', function($scope, $localStorage, $state){
    $scope.logOut = function(){

        $localStorage.removeItem('userToken');
        $localStorage.removeItem('userName');
        $localStorage.removeItem('userid');
        $state.go('app.login');

    };

})


.controller('HomeCtrl', ['$scope', 'mainFactory','usersFactory','baseURL','$ionicModal','$ionicPopover','$timeout',
'AuthService','picsFactory','$localStorage','FollowerService', function($scope, mainFactory,usersFactory, baseURL,$ionicModal,
$ionicPopover,$timeout,AuthService, picsFactory, $localStorage, FollowerService){


    $scope.baseURL = baseURL;
    $scope.message = "Loading...";
    $scope.showFeed = false;
    $scope.users = [];
    $scope.animIN = null;
    $scope.animOUT = false;




    //-------------- getting my user data ----------------------//
    $scope.myUsername = $localStorage.getObject('userName', null);
    $scope.myUserId = $localStorage.getObject('userid', null);
    $scope.myToken = AuthService.getAuthentication();
    console.log($scope.myToken);
    $scope.pics = null;


    $scope.doRefresh = function(){

      usersFactory.searchUser($scope.myUsername, $scope.myToken)
          .then(function success(res){

              $scope.myUser = usersFactory.getUser();
              console.log('my user is');
              console.log($scope.myUser);
              $localStorage.storeObject('userid', $scope.myUser.userId);

              //picsFactory.getUserPictures($scope.myUser.userId, 3, $scope.myToken);
              picsFactory.getUserPictures($scope.myUser.userId, 3, $scope.myToken)
                .then(function successCallback(res){
                      $scope.pics = picsFactory.getAllpictures();
                      console.log("pics: ");
                      console.log($scope.pics);

                });

                FollowerService.loadFollowers($scope.myUserId, $scope.myToken, true);
              //console.log("pics: ");
              //console.log($scope.pics);

              //$scope.photos = picsFactory.getMutualFollowerPics($scope.myUser.userId, 3, $scope.myToken);
      }, function fail(res){
              console.log(res);
      }).finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });


    };

    $scope.doRefresh();


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

    /*
    $scope.photos = mainFactory.query(
        function(response){

            $scope.photos = response;
            $scope.showFeed = true;

            $scope.users = usersFactory.query(
                function(response){

                    $scope.users = response;
                });


        },
        function(response){
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    */
    //---------- comments -------------//

    $scope.commentData = {};

    $ionicModal.fromTemplateUrl('templates/comment.html',{
        scope: $scope
    }).then(function(modal){
        $scope.comment = modal;
    });

    $scope.openComment = function(id){
        $scope.picture = $scope.photos[id];
        $scope.comment.show();
    };

    $scope.submitComment = function(id){
        if($scope.commentData.comment !== ''){

            var commentVar = {
                id: $scope.photos[id].comments.length + 1,
                firstName: $scope.users[$scope.userId].firstName,
                lastName: $scope.users[$scope.userId].lastName,
                userId: $scope.userId,
                comment: $scope.commentData.comment,
                date: new Date().toISOString()
            };

            $scope.photos[id].comments.push(commentVar);

            mainFactory.update({id:id},$scope.photos[id]);

            //$scope.commentForm.$setPristine();

            $scope.commentData.comment = "";


        }

    };

    $scope.deleteComment = function(photoid, commentid){

        var i = 0; len = $scope.photos[photoid].comments.length;
        for(; i < len; i++){

            if($scope.photos[photoid].comments[i].id === commentid){
                $scope.photos[photoid].comments.splice(i,1);
            mainFactory.update({id:photoid},$scope.photos[photoid]);
            }
        }


    };


    //---------- comments -------------//


    $scope.dejaAime = function(photoId, id){
        //function to check if user has already rated the picture
        /*var i = 0; len = $scope.photos[photoId].raters.length;
        for(; i < len; i++){

            if($scope.photos[photoId].raters[i].id === id){
                return true;
            }
        }
        return false;
        */
    };

    $scope.rateAnimation = function(photoId){

        $scope.animIN = photoId;

        $timeout(function anim(){
            $scope.animIN = null;
        }, 500);

    };


    $scope.rate = function(photoId, id, name){
        //this function takes the photo id, the id of the rater
        //and his name and add this info into the photo object
        console.log("rated");

        var rater = {
            id: id,
            name: name
        };

        if(!$scope.dejaAime(photoId, id)){

            $scope.photos[photoId].rating += 1;

            $scope.photos[photoId].raters.push(rater);

            mainFactory.update({id:photoId},$scope.photos[photoId]);

            $scope.rateAnimation(photoId);

        } else {

            $scope.photos[photoId].rating -= 1;

            var i = 0; len = $scope.photos[photoId].raters.length;
            for(; i < len; i++){

                if($scope.photos[photoId].raters[i].id === id){

                    $scope.photos[photoId].raters.splice(i,1);
                                                                    mainFactory.update({id:photoId},$scope.photos[photoId]);
                }
            }
        }


    };






    //TODO: render all the pictures from all the users
    //doesnt matter in what order at the main page - DONE
    //TODO: users are only the followers of the current user
    //TODO: implement followers on the json server
    //TODO: pictures should have date of uploading, show only the latest, make date filter - DONE (partial)
    //TODO: open comment modal for picture - DONE
    //TODO: comment modal text area should not be email

}])

.controller('EditCtrl',['$scope','baseURL','$stateParams', 'user','$ionicHistory','usersFactory','$ionicPopup','$location', function($scope, baseURL, $stateParams, user, $ionicHistory, usersFactory,$ionicPopup, $location){
    $scope.baseURL = baseURL;
    $scope.user = user;

    $scope.save = function(){

         if(($scope.user.firstName !== '')&& ($scope.user.lastName !== '')){



            var savedPopup = $ionicPopup.confirm({
                title: 'Confirm change',
                template: 'Are you sure you want edit your profile?'
            });

            savedPopup.then(function(res) {
                if (res) {

 usersFactory.update({id:$scope.user.id},$scope.user);
                    var changeView = function(){
                        $location.path('app.profile({id:user.id})');
                    };
                }
            });
         }

    };

    //$scope.save()

    $scope.myGoBack = function(){
        $ionicHistory.goBack();
    };
}])

.controller('ProfileCtrl',['$scope', 'mainFactory', 'usersFactory','$stateParams', '$ionicHistory',
 '$ionicModal','AuthService','$localStorage','picsFactory','$state','$location', '$anchorScroll','$ionicScrollDelegate','$timeout',
 '$rootScope','moment', 'FollowerService','$filter'
  ,function($scope, mainFactory, usersFactory, $stateParams, $ionicHistory, $ionicModal, AuthService, $localStorage, picsFactory,
     $state, $location, $anchorScroll, $ionicScrollDelegate, $timeout, $rootScope, moment, FollowerService, $filter){

    $scope.tab = 1;
    console.log('stateParams: ');
    console.log($stateParams);
    var PIC_NUMBER = 10;
    //-------------- getting my user data ----------------------//
    $scope.myUsername = $localStorage.getObject('userName', null);
    $scope.myToken =  $localStorage.getObject('userToken', null);
    $scope.myId = $localStorage.getObject('userid', null);
    $scope.pics = null;

    $scope.animIN = null;
    $scope.animOUT = false;



    $scope.doRefresh = function(){

      usersFactory.searchUser(null, $scope.myToken, $stateParams.id)
          .then(function success(res){
            $scope.user = usersFactory.getUser();
            console.log('my user is');
            console.log($scope.user);

            if($state === 'app.profile'){
                console.log("anchoring: " + anchor);
                $location.hash(0);
                var handle = $ionicScrollDelegate.$getByHandle('content');
                handle.anchorScroll();
            }

            $scope.followers = null;
            $scope.following = null;
            FollowerService.loadFollowers($scope.user.userId, $scope.myToken, $scope.user.userId === $scope.myId)
              .then(function successCallback(res){
                    $scope.followers = FollowerService.getFollowers();
                    $scope.following = FollowerService.getFollowing();
                    console.log($scope.followers);
                    console.log($scope.following);
                    $scope.checkUser($scope.user.userId);

              });


            //picsFactory.getUserPictures($scope.myUser.userId, 3, $scope.myToken);
            picsFactory.getUserPictures($scope.user.userId, PIC_NUMBER, $scope.myToken)
              .then(function successCallback(res){
                    $scope.pics = picsFactory.getAllpictures();
                    console.log("pics: ");
                    console.log($scope.pics);
                    //$scope.time = pics[0].uploaded;
                    //momentFromNow($scope.pics[0].uploaded);
              });

      }).finally(function() {
       // Stop the ion-refresher from spinning
       $scope.$broadcast('scroll.refreshComplete');
     });



    };

    $scope.doRefresh();

    $scope.select = function(setTab){
        $scope.tab = setTab;

    };

    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };


    //------------------ picture rating -------------------------------//
    var arrayObjectIndexOf = function(arr, obj){
      for(var i = 0; i < arr.length; i++){
          if(angular.equals(arr[i].id, obj)){
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
          var k = arrayObjectIndexOf($scope.pics[i].ratings, $scope.myId);
          if(k) return true;
      }
      return false;

    };

    $scope.ratePicture = function(picId, rating, token){

      if($scope.dejaAime(picId)){
          //we should be able to unrate this pic
          console.log("we should be able to unrate this pic");
      } else {
          picsFactory.ratePicture(picId, rating, token);
          $rootScope.$on('rate-success', function(event, args){
              $scope.pics[arrayObjectIndexOf($scope.pics, picId)] += rating;
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
                $scope.btnClass.btn = "button icon ion-gear-a";
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
                $scope.btnClass.userStats = "Mutual Follower";
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
      console.log(obj);
      $scope.com = obj;
    };

    $scope.closeComment = function() {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

}])

.controller('CompetitionController',['$scope','mainFactory','images',  'baseURL','competitionFactory', function($scope, mainFactory, images, baseURL, competitionFactory){



    $scope.pics = [];
    $scope.photos = [];
    $scope.tab = 1;
    var n;


    $scope.photos = competitionFactory.getCompetitionPics().get({id: 9});

    $scope.check = function(){
        console.log("pics filtered: " + $scope.pics.length);
    };


    $scope.baseURL = baseURL;


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

.controller('SearchCtrl',['$scope','usersFactory','$ionicModal','$localStorage',
 function($scope, usersFactory, $ionicModal, $localStorage){

    $scope.searchBox = null;
    $scope.tab = 1;
    $scope.searchText = "Search users here";
    var myToken =  $localStorage.getObject('userToken', null);
    $scope.users = null;
    $scope.searching = false;


    $scope.changeMe = function(){
        $scope.tab = 2;
        console.log("changed");
        $scope.searching = true;

        if($scope.searchBox !== null){
            usersFactory.findUserByName($scope.searchBox, myToken)
              .then(function successCallback(res){
                    $scope.users = usersFactory.getUserSearchList();
                    $scope.searching = false;
              }, function errorCallback(res){
                    $scope.searching = false;
                    $scope.searchText = "no results found";
              });
        };

    };







    $scope.select = function(setTab){
        $scope.tab = setTab;
    };

    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };

    $ionicModal.fromTemplateUrl('templates/comment.html',{
        scope: $scope
    }).then(function(modal){
        $scope.comment = modal;
    });

    $scope.openComment = function(id){
        $scope.picture = $scope.photos[id];
        $scope.comment.show();
    };




}])


.controller('FooterCtrl',['$scope','$ionicModal','$ionicPopover','AuthService','$state','usersFactory',
'NotificationService','$localStorage','$rootScope','$ionicHistory',function($scope,$ionicModal,$ionicPopover, AuthService, $state, usersFactory,
  NotificationService, $localStorage, $rootScope, $ionicHistory){

    $scope.$state = $state;
    console.log($scope.$state.current.name);
    var history = $ionicHistory.viewHistory();
    //history = $ionicHistory.viewHistory();

    console.log(history.currentView);
    console.log(history.backView.stateId);
    $rootScope.$broadcast('state-changed',history.backView.stateId);
    //$state.go($state.current,{}, {reload:true});

    var myUserToken = AuthService.getAuthentication();
    var myUsername = AuthService.getUsername();
    $scope.myId = $localStorage.getObject('userid', null);


    var notifications = [];
    $scope.myUser = usersFactory.getUser();

    usersFactory.searchUser(myUserToken, myUsername).then(function success(res){
        $scope.myUser = usersFactory.getUser();
        console.log('getting user from footer');

//        /$scope.$apply();
        notifications = NotificationService.getNotifications($scope.myUser.userId);

    });

    $scope.notifyingUsers = [];

    /*
    var getNotificationUsers = function(){
        for(i = 0; i < notifications.activityNotifications.length){
            userFactory.search(myUserToken)
        }

    }
    */

    $scope.tab = 1;

    $scope.select = function(setTab){
        $scope.tab = setTab;

    };

    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };




    $ionicModal.fromTemplateUrl('templates/notifications.html',{
        scope: $scope
    }).then(function(modal){
        $scope.modal = modal;
    });

    //$scope.userId = AuthService.getMockUser();
    //console.log($scope.userId);



    //popover config
    var template = '<ion-popover-view style="height:125px"><ion-content><div class="list"><a class="item" ng-click="closePopover()">Camera</a><a class="item"  ng-click="closePopover()">Gallery</a></div></ion-content></ion-popover-view>';

    $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
    });

    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };

    $scope.closePopover = function($event) {
        $scope.popover.hide($event);
    };

    $scope.goTO = function(){
         $state.go('app.picture');
    };

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
