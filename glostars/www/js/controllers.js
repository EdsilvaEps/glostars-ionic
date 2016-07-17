angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, AuthService, USER_ROLES, $rootScope) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
    
  $scope.options = {
      loop: false,
      speed: 400,
  };
    


  

  
    
    /*The ApplicationController is a container for a lot of global application logic, and an alternative to Angular’s run function. Since it’s at the root of the $scope tree, all other scopes will inherit from it (except isolate scopes). It’s a good place to define the currentUser object
    */
    
  $rootScope.currentUser = null;
  $scope.userRoles = USER_ROLES;
  $scope.isAuthorized = AuthService.isAuthorized;
 
  $scope.setCurrentUser = function (user) {
    $rootScope.currentUser = user;
  };
    
  //TODO: encrypt data
  //TODO: the swipe screen has three views now, handle them here
  $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $scope.user = AuthService.login($scope.loginData);
      $scope.setCurrentUser($scope.user);
      console.log("user is " + $scope.user.id);
      
  };
    

})



.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
    //change this controller to 'UserCtrl' 
})


.controller('LoginCtrl',['$scope', function($scope){
    

    
    $scope.options = {
        loop: false,
        speed: 400,
    }
    
    
    $scope.loginData = {};
    //TODO: encrypt data
    //TODO: the swipe screen has three views now, handle them here
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);
        // Simulate a login delay. Remove this and replace with your login
        
        // code if using a login system
    }
    
    
}])

.controller('SignUpCtrl', function($scope){
    //get sign up information
    //TODO: encrypt data
    $scope.userinfo = {};
    
    $scope.createAcc = function(){
        console.log('acc created', $scope.userinfo);
        //sign up function here
    }
})


.controller('HomeCtrl', ['$scope', 'mainFactory', 'usersFactory','baseURL','$ionicModal','$ionicPopover','$timeout','AuthService','$ionicPopover', function($scope, mainFactory,usersFactory, baseURL,$ionicModal,$ionicPopover,$timeout,AuthService,$ionicPopover){
   
    
    $scope.baseURL = baseURL;
    $scope.message = "Loading...";
    $scope.showFeed = false;
    $scope.users = [];
    $scope.animIN;
    $scope.animOUT = false;
    $scope.myUser = AuthService.getMockUser();
    
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
    
    
    $ionicModal.fromTemplateUrl('templates/comment.html',{
        scope: $scope
    }).then(function(modal){
        $scope.comment = modal;
    });
    
    $scope.openComment = function(id){
        $scope.picture = $scope.photos[id];
        $scope.comment.show();
    }
    
    
    $scope.dejaAime = function(photoId, id){
        //function to check if user has already rated the picture
        var i = 0; len = $scope.photos[photoId].raters.length;
        for(; i < len; i++){

            if($scope.photos[photoId].raters[i].id === id){
                return true;
            }
        }
        return false;
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

.controller('EditCtrl',['$scope','baseURL','$stateParams', 'user', function($scope, baseURL, $stateParams, user){
    $scope.baseURL = baseURL;
    $scope.user = user;
}])

.controller('ProfileCtrl',['$scope', 'mainFactory', 'usersFactory', 'baseURL','$stateParams','user', '$ionicHistory', '$ionicModal','AuthService' ,function($scope, mainFactory, usersFactory, baseURL, $stateParams, user, $ionicHistory, $ionicModal, AuthService){
    
    $scope.baseURL = baseURL;
    $scope.tab = 1;
    $scope.user = user;
    //$scope.photos = photos;
    $scope.users = [];
    
    
    $scope.numOfUserPics = function(id){
        var i = 0; len = $scope.photos.length; y =0;
        for(; i < len; i++){
            if($scope.photos[i].userId === id)
                y += 1;
        }
        return y
    };
    
    
    
    //TODO: make my user return a full user object
    //i can do nothing with just this id number
    $scope.myUser = AuthService.getMockUser();
    
    $scope.isFollower = function(id){
        //this functions check i am following the id user
        
        //Please, get only one user from the users
        //dont be a gluton
        //others might want a piece of memory too
        var i = 0; len = $scope.users[$scope.myUser].friends.length;
        for(; i < len; i++){

            if($scope.users[$scope.myUser].friends[i].id === id){
                return true;
            }
        }
        return false;
        
    };
    
    $scope.isFollowing = function(id){
        var i = 0; len = $scope.users[id].friends.length;
        for(; i < len; i++){

            if($scope.users[id].friends[i].id === $scope.myUser){
                return true;
            }
        }
        return false;
    };
    
    $scope.follow = function(i){
        
        //person to follow
        var following = {
            id: i,
            name: $scope.users[i].name,
            description: $scope.users[i].description
        };
        
        var me = {
            id: $scope.myUser,
            name: $scope.users[$scope.myUser].name,
            description: $scope.users[$scope.myUser].description
        };
        
        //push person data into list of follow
        $scope.users[$scope.myUser].friends.push(following);
        //issue update command to database
        usersFactory.update({id:$scope.myUser},$scope.users[$scope.myUser]);
       
        //add myself into that person's follower list
        $scope.users[i].followers.push(me);
        
        //issue server command again
        usersFactory.update({id:i}, $scope.users[i])
    };
    
    $scope.unfollow = function(id){
        
        //person to unfollow
        var i = 0; len = $scope.users[$scope.myUser].friends.length;
        for(; i < len; i++){

            if($scope.users[$scope.myUser].friends[i].id === id){
                //you're no worthy
                $scope.users[$scope.myUser].friends.splice(i,1);
                //done and done
                usersFactory.update({id:$scope.myUser},$scope.users[$scope.myUser]);
            }
        }
        
    }
    
    
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
    
    
    
    $scope.select = function(setTab){
        $scope.tab = setTab;
        
    };
    
    $scope.isSelected = function(checkTab){
        return ($scope.tab === checkTab);
    };
    
    $scope.myGoBack = function(){
        $ionicHistory.goBack();
    };
    
    //$scope.modal_n;
    $ionicModal.fromTemplateUrl('templates/notifications.html',{
        scope: $scope
    }).then(function(modal){
        $scope.modal = modal;
    });
    
    //TODO: include params - DONE
    //TODO: make modal for notifications - DONE
    //TODO: make page for friends - DONE (partially - make friends on the profile pg)
}])

.controller('CompetitionController',['$scope','mainFactory','images',  'baseURL', function($scope, mainFactory, images, baseURL){
    
    
    
    $scope.pics = [];
    $scope.photos = [];
    $scope.tab = 1;
    var n;
    
    $scope.photos = mainFactory.query(
        function(response){
            
            $scope.photos = response;
            $scope.showFeed = true;
            var n = $scope.photos.length;
            
            //filter the 'photos' array and make a new array
            //only with photos listed "competition" in category
            for(var i = 0; i < n; i++){
                if($scope.photos[i].category === 'competition'){
                    $scope.pics.push($scope.photos[i]);
                
                }    
            }
            
            
        },
        function(response){
            $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    
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

.controller('PictureUploadCtrl',['$scope','$ionicPlatform', function($scope, $ionicPlatform){
    
    //IMAGE PICKER MISSING
    
    /* UNCOMMENT WHEN TESTING ON DEVICE FOR ENABLING CAMERA AND GALLERY FUNCTIONALITY
     
    $ionicPlatform.ready(function(){
        $scope.galleryPicker = function(){
            var options={
                maximumImagesCount:1, // Max number of selected pics
                width: 800,
                height: 800,
                quality: 100<div ng-repeat="photo in photos">
      </div>
            };
        
        
            $cordovaImagePicker.getPictures(options).then(function(results){
                //Loop through acquired images
                for(var i = 0; i < results.length; i++){
                    console.log('Image URI: ' + results[i]);
                }
            }, function(error){
                console.log('Error: ' + JSON.stringify(error));
                //in case of error
            });
        };
        
        $scope.takePicture = function(){
            
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
            $cordovaCamera.getPicture(options).then(function(imageData) {
        $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
        }, function(err) {
            console.log(err);
        });

        };        
        
        
    }); */
    
    
}])

.controller('SearchCtrl',['$scope','baseURL', 'mainFactory','usersFactory','$ionicModal', function($scope,baseURL,mainFactory, usersFactory,$ionicModal){
    
    $scope.baseURL = baseURL;
    $scope.searchBox;
    $scope.tab = 1;
    
    
    $scope.changeMe = function(){
        $scope.tab = 2;
        console.log("changed");
    };
    
    $scope.names = [];
    

    $scope.photos = mainFactory.query(
        function(response){
            $scope.photos = response;
            
            
        },
        function(response){
            //some error routine
        });
    
    $scope.peoples = usersFactory.query(
        function(response){
            $scope.peoples = response;
            //IMPLEMENT FACTORY FUNCTION TO GET ONLY NAMES AND ID'S
            
        },
        function(){
            //some error
        });
    
    
    
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
    }
            
    
    
    
}])

.controller('FooterCtrl',['$scope','$ionicModal','$ionicPopover','AuthService',function($scope,$ionicModal,$ionicPopover, AuthService){
    
    $ionicModal.fromTemplateUrl('templates/notifications.html',{
        scope: $scope
    }).then(function(modal){
        $scope.modal = modal;
    });
    
    $scope.userId = AuthService.getMockUser();
    
    
    //popover config
    var template = '<ion-popover-view style="height:125px"><ion-content><div class="list"><a class="item">Camera</a><a class="item" ng-click="closePopover($event)" ui-sref="app.photoup()" >Gallery</a></div></ion-content></ion-popover-view>';
    
    $scope.popover = $ionicPopover.fromTemplate(template, {
        scope: $scope
    });

    $scope.openPopover = function($event) {
        $scope.popover.show($event);
    };
    
    $scope.closePopover = function($event) {
        $scope.popover.hide($event);
    }
    
    $scope.mailBox = function(){
        //something should happen when the letterbox is clicked
        console.log("letterbox");
    }
    
    
}])


.filter('searchContacts', function(){
  return function (items, query) {
    var filtered = [];
    var letterMatch = new RegExp(query, 'i');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (query) {
        if (letterMatch.test(item.name.substring(0, query.length))) {
          filtered.push(item);
          
        }
      } else {
        filtered.push(item);
      }
    }
      console.log(filtered[0]);
    return filtered;
  };
})






;


