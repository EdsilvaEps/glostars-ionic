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

angular.module('glostarsApp')
        .constant("baseURL", "http://localhost:3000/")
        .service('mainFactory',['$resource', 'baseURL', function($resourse, baseURL){
            
            this.getUsers = function(){
                
                //this function returns all the data about the users currently in the database
                return $resourse(baseURL+"users/:id", null,{'update':{method:'PUT'}});
            };
            
            
            
        }])

;