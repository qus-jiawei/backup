// setup the angularjs
var uvpapp = angular.module('uvpApp', ['ngRoute', 'ngAnimate']);

uvpapp.config(['$routeProvider', "$interpolateProvider", function($routeProvider, $interpolateProvider) {
	$interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
    $routeProvider
        .when('/overview',
        {
            controller: 'OverviewCtrl',
            templateUrl: '/statics/partials/overview.html'
        })
        .when('/:clusterid/cluster',
        {
            controller: 'ClusterCtrl',
            templateUrl: '/statics/partials/cluster.html'
        })
        .when('/:clusterid/instance',
        {
            controller: 'InstanceCtrl',
            templateUrl: '/statics/partials/instance.html'
        })
        .when('/:clusterid/volume',
        {
            controller: 'VolumeCtrl',
            templateUrl: '/statics/partials/volume.html'
        })
        .when('/:clusterid/image',
        {
            controller: 'ImageCtrl',
            templateUrl: '/statics/partials/image.html'
        })
        .when('/:clusterid/network',
        {
            controller: 'NetworkCtrl',
            templateUrl: '/statics/partials/network.html'
        })
        .when('/:clusterid/host',
        {
            controller: 'HostCtrl',
            templateUrl: '/statics/partials/host.html'
        })
        .otherwise({ redirectTo: '/overview' });
}]);


uvpapp.controller('menuCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location){
    $scope.getClass = function(url) {
        if (url) {
            var url_ = url.slice(1);
            return $location.path() === url_;
        }
    };
    $scope.show = 0;
    $scope.$on('$routeChangeStart', function(to, from){
        var regt= /([0-9]+)/;
        var clusterid = $location.path().match(regt);
        if(clusterid) {
            $scope.show = clusterid[0] - 1;
        }
    });
    $rootScope.closeModal = function(modalid) {
        $(modalid).modal('hide');
    };

    $scope.togle = function(index) {
        $scope.show = index;
    }

    $scope.menuData = {};
    $http({
        method: 'GET',
        url: '/statics/static_data/memu.json'
    }).success(function(response, status, headers, config){
        $scope.menuData = response;
    }).error(function(data, status) {

        $scope.status = status;
    });

}]);

uvpapp.controller('OverviewCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.tipinfoData =[];
    $http({
        method: 'GET',
        url: '/statics/static_data/tipinfoData.json'
    }).success(function(response, status, headers, config){
        $scope.tipinfoData = response;
    }).error(function(data, status) {

        $scope.status = status;
    });
}]);

uvpapp.controller('ClusterCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.hostData =[];
    $http({
        method: 'GET',
        url: '/statics/static_data/hostData.json'
    }).success(function(response, status, headers, config){
        $scope.hostData = response;
    }).error(function(data, status) {

        $scope.status = status;
    });

    $scope.instanceData =[];
    $http({
        method: 'GET',
        url: '/statics/static_data/instanceData.json'
    }).success(function(response, status, headers, config){
        $scope.instanceData = response;
    }).error(function(data, status) {

        $scope.status = status;
    });
}]);

uvpapp.controller('InstanceCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
    this.current = {"name": "instance-999927437329", "cpu":"1核", "mem":"34GB", "status":"正常", "lasttime":"2小时"
        , "volumes":["volume-32423424234     65GB", "volume-98798989799     95GB"], "template": "image-wyoerdfsdfs67"};

    $scope.instanceList = [];
    $http({
        method: 'GET',
        url: '/statics/static_data/instanceListData.json'
    }).success(function(response, status, headers, config){
        $scope.instanceList = response;
    }).error(function(data, status) {

        $scope.status = status;
    });

    $scope.instanceVolumeList = [];
    $scope.instanceVolume = function(volumeid) {
        $http({
            method: 'GET',
            url: '/statics/static_data/instanceVolumeList.json'
        }).success(function(response, status, headers, config){
            $scope.instanceVolumeList = response;
        }).error(function(data, status) {

            $scope.status = status;
        });
        $('#volumeModal').modal('show');
    }

    $scope.instanceSnapshotList = []
    $scope.instanceSnapshot = function(snapshotid) {
        $http({
            method: 'GET',
            url: '/statics/static_data/instanceSnapshotList.json'
        }).success(function(response, status, headers, config){
                $scope.instanceSnapshotList = response;
            }).error(function(data, status) {

                $scope.status = status;
            });
        $('#snapshotModal').modal('show');
    };

    $scope.modal_title = "创建虚拟机实例";
    $scope.createInstance = function() {
        $scope.modal_title = "创建虚拟机实例";
        $('#createInstanceModal').modal('show');
    };
    $scope.midifyInstance = function() {
        $scope.modal_title = "修改虚拟机实例";
        $('#createInstanceModal').modal('show');
    };

    var i = 1;
    $scope.vlanNetwork = [];
    $scope.vlanNetwork.push(i++);
    $scope.addVlanNetwork = function() {
        $scope.vlanNetwork.push(i++);
    };
}]);

uvpapp.controller('VolumeCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
    $scope.volumeList =[];
    $http({
        method: 'GET',
        url: '/statics/static_data/volumeDataList.json'
    }).success(function(response, status, headers, config){
        $scope.volumeList = response;
    }).error(function(data, status) {

        $scope.status = status;
    });

    $scope.volumeSnapshotList = [];
    $scope.volumeSnapshot = function(snapshotid) {
        $http({
            method: 'GET',
            url: '/statics/static_data/volumeSnapshotList.json'
        }).success(function(response, status, headers, config){
                $scope.volumeSnapshotList = response;
            }).error(function(data, status) {

                $scope.status = status;
            });
        $('#snapshotModal').modal('show');
    };
    $scope.attachVolume = function() {
        $('#attachVolumeModal').modal('show');
    };

    $scope.modal_title = "新建存储卷";
    $scope.createVolume = function() {
        $scope.modal_title = "新建存储卷";
        $('#createVolumeModal').modal('show');
    }
    $scope.modifyVolume = function() {
        $scope.modal_title = "修改存储卷";
        $('#createVolumeModal').modal('show');
    };
}]);

uvpapp.controller('ImageCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
    $scope.imageList =[];
    $http({
        method: 'GET',
        url: '/statics/static_data/imageDataList.json'
    }).success(function(response, status, headers, config){
        $scope.imageList = response;
    }).error(function(data, status) {

        $scope.status = status;
    });

    var i = 1;
    $scope.vlanNetwork = [];
    $scope.vlanNetwork.push(i++);
    $scope.addVlanNetwork = function() {
        $scope.vlanNetwork.push(i++);
    };
    $scope.createInstance = function() {
        $('#createInstanceModal').modal('show');
    }

    $scope.uploadImage = function() {
        $('#uploadImageModal').modal('show');
    }
}]);


uvpapp.controller('NetworkCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
    $scope.networkList =[];
    $http({
        method: 'GET',
        url: '/statics/static_data/networkDataList.json'
    }).success(function(response, status, headers, config){
        $scope.networkList  = response;
    }).error(function(data, status) {

        $scope.status = status;
    });

    $scope.createNetwork = function() {
        $('#createNetworkModal').modal('show');
    }
}]);

uvpapp.controller('HostCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http){
    this.current = {"name":"主机-YXYEDJSFJFHJFJ", "load":"40", "cpu_percent":"50%", "mem_percent":"70%", "cpu":"24", "mem":"56GB"
        , "ip":"172.23.22.44", "node_type":"计算节点", "storage":"160GB", "services":["nova-compute","ovs-agent"]
        , "start_time":"2013-33-12 12:33:55", "instance":"6", "status":"正常", "operation":"停用"};

    $scope.hostList = [];
    $http({
        method: 'GET',
        url: '/statics/static_data/hostListData.json'
    }).success(function(response, status, headers, config){
        $scope.hostList = response;
    }).error(function(data, status) {

        $scope.status = status;
    });
}]);
