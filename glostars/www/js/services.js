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
        .factory('mainFactory',['$resource', 'baseURL', function($resource, baseURL){
            
                
                //this function returns ALL the photos and data about them uploaded by users currently in the database
                return $resource(baseURL+"photos/:id", null,{'update':{method:'PUT'}});
            
            
            
        }])

        .factory('usersFactory', ['$resource', 'baseURL', function($resource, baseURL){
            
            //this function returns ALL the users and data about them
            return $resource(baseURL+"users/:id", null,{'update':{method:'PUT'}});
              
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