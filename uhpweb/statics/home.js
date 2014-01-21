// setup the angularjs
var uhpApp = angular.module('uhpApp', ['ngRoute', 'ngAnimate']);

uhpApp.config(['$routeProvider', "$interpolateProvider", function($routeProvider, $interpolateProvider) {
	$interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
    $routeProvider
        .when('/admin-service',
        {
            controller: 'ServiceCtrl',
            templateUrl: '/statics/partials/service.html'
        })
        .when('/admin-hosts',
        {
            controller: 'HostsCtrl',
            templateUrl: '/statics/partials/hosts.html'
        })
        .otherwise({ redirectTo: '/admin-service' });
}]);

uhpApp.controller('NarCtrl',['$scope','$http',function($scope,$http){
	$scope.user={}
	$scope.menus={}
	$scope.submenus={}
	 $http({
	        method: 'GET',
	        url: '/statics/static_data/user.json'
	    }).success(function(response, status, headers, config){
	        $scope.menus = response["menus"];
	        $scope.user = response["user"];
	        $scope.submenus = response["submenus"];
	    }).error(function(data, status) {
	        $scope.status = status;
	    });
}])
uhpApp.controller('ServiceCtrl',['$scope','$http',function($scope,$http){
	$scope.services={}
	 $http({
	        method: 'GET',
	        url: '/statics/static_data/service_info.json'
	    }).success(function(response, status, headers, config){
	        $scope.services = response["services"];
	    }).error(function(data, status) {
	        $scope.status = status;
	    });
}])

