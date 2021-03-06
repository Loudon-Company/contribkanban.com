'use strict';

projectKanbanApp.controller('browseCtrl', [
    '$q',
    '$scope',
    '$routeParams',
    '$location',
    'parseService',
    'projectService',
    function ($q, $scope, $routeParams, $location, parseService, projectService) {
      $scope.location = $location;
      $scope.projects = [];
      $scope.routePath = 'board';
      $scope.addType = 'Project';
      $scope.addPlaceholder = 'Project machine name';

      $scope.queryProjects = function () {
        var deferred = $q.defer();
        var parseQuery = parseService.objectQuery('Project');

        // If passed a type, filter by that.
        if ($routeParams.type !== undefined) {
          parseQuery.equalTo('projectType', 'project_' + $routeParams.type);
        }
        // @todo: Need to come up with a paging solution.
        parseQuery.limit(200);

        parseQuery.find({}).then(function (results) {
          var projectBuffer = [];
          angular.forEach(results, function(val, key) {
            projectBuffer.push(val.attributes);
          });

          deferred.resolve(projectBuffer);
        }, function () {

        });

        return deferred.promise;
      };
      $scope.queryProjects().then(function (projectBuffer) {
        $scope.projects = projectBuffer;
      });
      $scope.updateScopeProject = function (object, project) {
        $scope.queryProjects();
        project = null;
      };

      $scope.addBoard = function (project) {
        // Query Parse if machine name exists.
        parseService.attributeQuery('Project', 'machine_name', project).then(
          function (object) {
            // If the project does not exist, save it.
            if (object === null) {
              projectService.requestProject(project).then(function (response) {
                // New Parse object.
                parseService.saveObject('Project', response).then(function (parseObject) {
                  // Update the scope.
                  $scope.updateScopeProject(parseObject.attributes, project);
                  $scope.$apply();
                }, function () {
                });
              });
            } else {
              projectService.requestProject(project.machine_name).then(function (response) {
                object.set('releaseBranches', response.releaseBranches);
                object.save();
                $scope.updateScopeProject(object.attributes, project);
              });
            }

          },
          function (error) {
            console.log(error)
          });
      }
    }
  ]
);
