// setup the angularjs
function inArray(array,str){
	for(var i in array){
		if(array[i]==str) return true;
	}
	return false;
}
//搜索数组中是否有类似的字符串
function searchArray(array,str){
	for(var i in array){
		if(array[i].indexOf(str)>=0) return true;
	}
	return false;
}
//
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
        .when('/admin-host',
        {
            controller: 'HostsCtrl',
            templateUrl: '/statics/partials/host.html'
        })
        .when('/admin-task',
        {
            controller: 'TaskCtrl',
            templateUrl: '/statics/partials/task.html'
        })
        .otherwise({ redirectTo: '/admin-service' });
}]);

uhpApp.controller('NarCtrl',['$scope','$rootScope','$interval','$http',function($scope,$rootScope,$interval,$http){
	$scope.user={}
	$scope.menus={}
	$scope.submenus={}
	$http({
	        method: 'GET',
	        url: '/back/user'
	    }).success(function(response, status, headers, config){
	        $scope.menus = response["menus"];
	        $scope.user = response["user"];
	        //TODO 判断深度连接使用adminmenus或者usermenus
	        $scope.submenus = response["adminmenus"];
	    }).error(function(data, status) {
	        $scope.status = status;
	    });
	//轮询指定的执行任务，获取进度。在任务地方想调用进度条。
	//可以设置$rootScope的runningid然后调用$rootScope.beginProgress即可
	$rootScope.beginProgress=function(){
		if( $rootScope.runningId==null){
			//console.log("running id is undefine");
			return ;
		}
		$("#progressModal").modal({});
		$rootScope.progress=0;
		$rootScope.close=false;
		$rootScope.updateProgress();
		$rootScope.success=false;
		stop = $interval($rootScope.updateProgress, 1000);
		
	}
	$rootScope.updateProgress=function(){
		if( $rootScope.close ) return;
		$rootScope.progress += 10;
		if( $rootScope.progress == 100 ){
			$rootScope.successProgress();
		}
	}
	$rootScope.successProgress=function(){
		if (angular.isDefined(stop)) {
	      $interval.cancel(stop);
	      stop = undefined;
	    }
		$rootScope.success=true;
	}
	$rootScope.closeProgress=function(){
		if (angular.isDefined(stop)) {
	      $interval.cancel(stop);
	      stop = undefined;
	    }
		$("#progressModal").modal('hide');
	}
	$rootScope.isActiveMenu=function(menu){
		if($rootScope.menu == menu) return "active";
		else return "";
	}
	$rootScope.isActiveSubmenu=function(submenu){
		if($rootScope.submenu == submenu) return "active";
		else return "";
	}
	$rootScope.jump=function(path){
		window.location.href=path;
	}
	
}])
uhpApp.controller('ServiceCtrl',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
	$rootScope.menu="admin";
	$rootScope.submenu="service";	
	//初始化service的静态信息
	 $http({
	        method: 'GET',
	        url: '/back/services_info'
	    }).success(function(response, status, headers, config){
	    	$scope.services = response["services"];
	        $scope.nowService =  $scope.services[0].name;
	    }).error(function(data, status) {
	        $scope.status = status;
	    });
	 
	 
	$scope.$watch("nowService",function(newValue, oldValue) {
		$scope.updateNowService();
	}) ;
	
	//修改或者选择service的初始化
	$scope.updateNowService=function(){
		for(var index in $scope.services ){
			var ser=$scope.services[index];
	        if(ser.name == $scope.nowService){
        		$scope.actions = ser.actions;
        		$scope.instanceActions = ser.instanceActions;
        		break;
        	}
        }
		//初始化instance
		$scope.initInstance();
		//初始化confvar
		$scope.initConf();

		$scope.chosenAll=false;
		$scope.chosenInstance={};
	}
	
	$scope.initInstance=function(){
		console.log( $scope.nowService );
		if( $scope.nowService == null || $scope.nowService==""){
			$scope.instances = [];
			$scope.summary = "";
			return;
		}
		$http({
	        method: 'GET',
	        url: '/back/service_info',
	        params:  { "service" : $scope.nowService }
	    }).success(function(response, status, headers, config){
	        $scope.summary=$scope.nowService+" "+response['summary'];
	        $scope.instances = response['instances'];
	    }).error(function(data, status) {
	    	alert("init service_info error");
	    });
	}
	
	$scope.initConf=function(){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/conf_var.json',
	        params:  { "service" : $scope.nowService }
	    }).success(function(response, status, headers, config){
	        $scope.confVar=response["conf"];
	    }).error(function(data, status) {
	    	alert("init service_info error");
	    });
	}
	
	$scope.$watch("chosenAll",function(newValue, oldValue) {
		if($scope.instances!=null){
			var size = $scope.instances.length;
			for( var index=0;index<size;index++){
				$scope.chosenInstance[index]=newValue;
			}
		}
	}) ;
	
	$scope.serviceClass=function(serviceName){
		if($scope.nowService==serviceName) return "active";
		else return "";
	}
	$scope.changeService=function(serviceName){
		$scope.nowService=serviceName;
	}
	//tab操作和跳转
	$scope.tab="info";
	$scope.tabClass=function(tabName,suffix){
		if(suffix==null) suffix="";
		if($scope.tab==tabName) return "active "+suffix;
		else return "";
	}
	
	$scope.getInstanceList=function(){
		var list="";
		if( $scope.instances!=null && $scope.chosenInstance!=null){
			var first=true;
			for( var index in $scope.instances){
				if( $scope.chosenInstance[index] ){
					if(first)first=false;
					else list+=",";
					list+=$scope.instances[index].name;
				}
			}
		}
		console.log(list)
		return list;
	}
	//提交action
	$scope.getActionObject=function(){
		if( $scope.actionType=="service" ){
			return $scope.nowService;
		}
		else{
			console.log("into actionobject")
			return "以下机器";
		}
	}
	$scope.readySendServiceAction=function(action){
		$scope.todoAction = action;
		$scope.actionType = "service";
		$scope.InstanceList = "";
		$("#serviceActionModal").modal({});
	}
	$scope.readySendInstanceAction=function(action){
		$scope.todoAction = action;
		$scope.actionType = "instance";
		$scope.InstanceList = $scope.getInstanceList();
		if( $scope.InstanceList == "" ){
			alert("请选择实例");
		}
		else{
			$("#serviceActionModal").modal({});
		}
	}
	$scope.sendAction=function(action){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/send_action.json',
	        params:  
	        	{
	        		"service" : $scope.nowService,
	        		"type" : $scope.actionType,
	        		"instances" : $scope.InstanceList
	        	}
	    }).success(function(response, status, headers, config){
	        if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
	//添加config
	$scope.addConfVar=function(){
		$scope.nowConfVar=null;
		$scope.nowConfVar={"group":$scope.nowService};
		$scope.showConfModal();
	}
	//修改config
	$scope.editConfVar=function(oneConfVar){
		$scope.nowConfVar=oneConfVar;
		for(var key in oneConfVar){
			$scope.nowConfVar[key]=oneConfVar[key];
		}
		$scope.showConfModal();
	}
	$scope.showConfModal=function(){
		$("#serviceConfModal").modal({});
	}
	//保存conf
	$scope.saveConf=function(){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/save_confvar.json',
	        params:  
	        	{
	        		"group" : $scope.nowConfVar.group,
	        		"name" : $scope.nowConfVar.name,
	        		"value" : $scope.nowConfVar.value,
	        		"type" : $scope.nowConfVar.type,
	        		"text" : $scope.nowConfVar.text
	        	}
	    }).success(function(response, status, headers, config){
	        if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
		$scope.initConf();
	}
}])


uhpApp.controller('HostsCtrl',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
	//tab操作和跳转
	$rootScope.menu="admin";
	$rootScope.submenu="host";	
	$scope.tab="host";
	$scope.tabClass=function(tabName,suffix){
		if(suffix==null) suffix="";
		if($scope.tab==tabName) return "active "+suffix;
		else return "";
	}
	//初始化机器和角色的对应关系
	$scope.initHost=function(){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/hosts.json',
	    }).success(function(response, status, headers, config){
	        $scope.hosts = response['hosts'];
	        $scope.roles = response['roles'];
	        $scope.groups = response['groups'];
	        $scope.initHostRole() 
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
	$scope.filterHostBySearchInfo=function(hosts,search){
		if(search==null||search=="") return hosts;
		var ret={};
		angular.forEach(hosts, function(value, key) {
	        if( key.indexOf(search) >=0 || searchArray(value['info'],search) ) {
	            ret[key] = value;
	        }
	    });
		return ret;
	}
	//
	$scope.readyAddHost=function(){
		$("#hostNewHostModal").modal({});
	}
	$scope.addHost=function(){
		var runningId = null;
		$http({
	        method: 'GET',
	        url: '/statics/static_data/add_host.json'
	    }).success(function(response, status, headers, config){
	    	if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    	$rootScope.runningId=response["runningId"];
	    	$rootScope.beginProgress();
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
	$scope.initHost();
	//通过hosts保存的真实的关系初始化hostRoleMap的对应关系
	$scope.initHostRole=function(){
		var map={};
		for(var host in $scope.hosts){
			map[host]={};
			var roleList = $scope.hosts[host]['role']
			for(var index in $scope.roles ){
				var role = $scope.roles [index];
				if( inArray(roleList,role) ) map[host][role]=true;
				else map[host][role]=false;
			}
		}
		$scope.hostRoleMap = map;
	}
	//hostRoleMap
	$scope.filterHostBySearch=function(hosts,search){
		if(search==null||search=="") return hosts;
		var ret={};
		angular.forEach(hosts, function(value, key) {
	        if( key.indexOf(search) >=0 ) {
	            ret[key] = value;
	        }
	    });
		return ret;
	}
	$scope.readySetupService=function(){
		var del=[];
		var add=[];
		for(var host in $scope.hosts){
			var roleList = $scope.hosts[host]['role']
			for(var index in $scope.roles ){
				var role = $scope.roles [index];
				var oldRea = inArray(roleList,role);
				var newRea = $scope.hostRoleMap[host][role];
				if( oldRea && !newRea ){
					del.push({"host":host,"role":role});
				}
				if( !oldRea && newRea ){
					add.push({"host":host,"role":role});
				}
			}
		}
		$scope.addService=add;
		$scope.delService=del;
		$("#hostNewServiceModal").modal({});
	}
	$scope.setupService=function(){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/setup_service.json',
	        params:  
        	{
        		"add" : angular.toJson($scope.addService),
        		"del" : angular.toJson($scope.delService)
        	}
	    }).success(function(response, status, headers, config){
	    	if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    	$rootScope.runningId=response["runningId"];
	    	$rootScope.beginProgress();
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}

	
}])

