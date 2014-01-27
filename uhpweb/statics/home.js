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
	//调用$rootScope.beginProgress即可传入任务id的数组
	$rootScope.beginProgress=function(id,callback){
		$rootScope.runningId = id;
		$("#progressModal").modal({});
		$rootScope.progress=0;
		$rootScope.progressMessage="";
		$rootScope.progressCallback=callback;
		$rootScope.close=false;
		$rootScope.updateProgress();
		$rootScope.success=false;
		stop = $interval($rootScope.updateProgress, 1000);
	}
	$rootScope.updateProgress=function(){
		if( $rootScope.close ) return;
		console.log(angular.toJson($rootScope.runningId))
		$http({
	        method: 'GET',
	        url: '/back/query_progress',
	        params:  { "id" : angular.toJson($rootScope.runningId) }
	    }).success(function(response, status, headers, config){
	    	if( $rootScope.progress != response['progress'] ){
	    		$rootScope.progress = response['progress'];
	    		$rootScope.progressMessage += response['progressMsg'];
	    	}
	    }).error(function(data, status) {
	        alert("get progress error");
	        $rootScope.closeProgress()
	    });
		
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
		if( $rootScope.progressCallback !=null ){
			$rootScope.progressCallback();
		}
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
	//初始化组列表
	 $http({
	        method: 'GET',
	        url: '/back/group_host_list'
	    }).success(function(response, status, headers, config){
	    	$scope.groups = [];
	    	angular.forEach(response["groups"], function(value, key) {
	    		$scope.groups.push(value.name);
		    });
	    	$scope.hosts = [];
	    	angular.forEach(response["hosts"], function(value, key) {
	    		$scope.hosts.push(value.name);
		    });
	    	$scope.nowGroup = $scope.groups[0];
	    	$scope.nowHost = $scope.hosts[0];
	    	$scope.showType = "group";
	    }).error(function(data, status) {
	        $scope.status = status;
	    });
	 
	 
	$scope.$watch("nowService",function(newValue, oldValue) {
		$scope.updateNowService();
	}) ;
	$scope.$watch("showType",function(newValue,oldValue){
		$scope.initConf();
	});
	$scope.$watch("nowGroup",function(newValue, oldValue) {
		$scope.initConf();
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
		if( $scope.nowService == null || $scope.nowGroup == null || $scope.showType == null ){
			return;
		}
		$http({
	        method: 'GET',
	        url: '/back/conf_var',
	        params:  { 
	        	"service" : $scope.nowService ,
	        	"group": $scope.nowGroup,
	        	"showType" : $scope.showType,
	        }
	    }).success(function(response, status, headers, config){
	        $scope.confVar=response["conf"];
	        //将所有的list的逗号转换为\n
	        angular.forEach($scope.confVar, function(value, key) {
		        if( value.type=="list" ) {
		        	value.value = value.value.replace(new RegExp(",","gm"),"\n");
		        }
		    });
	    }).error(function(data, status) {
	    	alert("init service_info error");
	    });
	}
	
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
					else list+="\n";
					list+=$scope.instances[index].host+"-"+$scope.instances[index].role;
				}
			}
		}
		return list;
	}
	//提交action
	$scope.getActionObject=function(){
		if( $scope.actionType=="service" ){
			return $scope.nowService;
		}
		else{
			return "以下机器";
		}
	}
	$scope.readySendServiceAction=function(action){
		$scope.todoAction = action;
		$scope.actionType = "service";
		$scope.instanceList = "";
		$("#serviceActionModal").modal({});
	}
	$scope.readySendInstanceAction=function(action){
		$scope.todoAction = action;
		$scope.actionType = "instance";
		$scope.instanceList = $scope.getInstanceList();
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
	        url: '/back/send_action',
	        params:  
	        	{
	        		"service" : $scope.nowService,
	        		"taskName" : $scope.todoAction,
	        		"actionType" : $scope.actionType,
	        		"instances" : $scope.instanceList.replace(new RegExp("\n","gm"),",")
	        	}
	    }).success(function(response, status, headers, config){
	        if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
	//展示conf
	$scope.showConfTitle=function(){
		if($scope.showType=="group"){
			return "配置组";
		}
		else{
			return "机器名称";
		}
	}
	//添加config
	$scope.addConfVar=function(){
		if($scope.showType=="group"){
			$scope.nowConfVar={"service":$scope.nowService,"group": $scope.nowGroup,"type":"string"};
		}
		else{
			$scope.nowConfVar={"service":$scope.nowService,"type":"string"};
		}
		$scope.showConfModal();
	}
	//修改config
	$scope.editConfVar=function(oneConfVar){
		$scope.nowConfVar=oneConfVar;
		for(var key in oneConfVar){
			$scope.nowConfVar[key]=oneConfVar[key];
		}
		$scope.nowConfVar["host"] = oneConfVar['group']
		$scope.nowConfVar["service"] = $scope.nowService
		$scope.nowConfVar["del"] = true;
		$scope.showConfModal();
	}
	$scope.showConfModal=function(){
		$("#serviceConfModal").modal({});
	}
	//保存修改删除conf
	$scope.saveConf=function(del){
		if( $scope.nowConfVar.type == "list"){
			$scope.nowConfVar.value = $scope.nowConfVar.value.replace(new RegExp("\n","gm"),",");
		}
		$http({
	        method: 'GET',
	        url: '/back/save_confvar',
	        params:  
	        	{
	        		"service" : $scope.nowService,
	        		"showType" : $scope.showType,
	        		"group" : $scope.nowConfVar.group,
	        		"host" : $scope.nowConfVar.host,
	        		"name" : $scope.nowConfVar.name,
	        		"value" : $scope.nowConfVar.value,
	        		"type" : $scope.nowConfVar.type,
	        		"text" : $scope.nowConfVar.text,
	        		"del" : del
	        	}
	    }).success(function(response, status, headers, config){
	        if(response["ret"]=="ok"){
	        	$scope.initConf();
	        }
	        else{
	        	alert("提交失败:"+response["msg"]);
	        }
	        
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
}])


uhpApp.controller('HostsCtrl',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
	//tab操作和跳转
	$rootScope.menu="admin";
	$rootScope.submenu="host";	
	//初始化各种数据
	$scope.$watch('tab',function(newValue,oldValue){
		if(newValue=="host")$scope.initHost();
		if(newValue=="role")$scope.initRole();
		if(newValue=="group")$scope.initGroup();
	});
	$scope.tab="host";
	$scope.tabClass=function(tabName,suffix){
		if(suffix==null) suffix="";
		if($scope.tab==tabName) return "active "+suffix;
		else return "";
	}
	//初始化机器和角色的对应关系
	$scope.initHost=function(){
		console.log("init host")
		$http({
	        method: 'GET',
	        url: '/back/hosts',
	    }).success(function(response, status, headers, config){
	    	$scope.hosts = response['hosts'];
	    }).error(function(data, status) {
	    	alert("发送hosts请求失败");
	    });
		$scope.chosenHost={}
	}
	$scope.initRole=function(){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/hostrole.json',
	    }).success(function(response, status, headers, config){
	    	$scope.roles = response['roles'];
	    	$scope.hostroles = response['hostroles']
	    	$scope.initHostRole()
	    }).error(function(data, status) {
	    	alert("发送initrole请求失败");
	    });
	}
	//通过hostroles保存的真实的关系初始化hostRoleMap的对应关系
	$scope.initHostRole=function(){
		var map={};
		for(var host in $scope.hostroles){
			map[host]={};
			var roleList = $scope.hostroles[host]['role']
			for(var index in $scope.roles ){
				var role = $scope.roles [index];
				if( inArray(roleList,role) ) map[host][role]=true;
				else map[host][role]=false;
			}
		}
		$scope.hostRoleMap = map;
	}
	$scope.initGroup=function(){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/hostgroup.json',
	    }).success(function(response, status, headers, config){
	    	$scope.groups = response['groups'];
	    	$scope.hostgroups = response['hostgroups']
	    	$scope.initHostGroup();
	    }).error(function(data, status) {
	    	alert("发送initgroup请求失败");
	    });
	}
	$scope.initHostGroup=function(){
		var map={};
		for(var host in $scope.hostgroups){
			map[host]={};
			var groupList = $scope.hostgroups[host]['group']
			for(var index in $scope.groups ){
				var group = $scope.groups [index];
				if( inArray(groupList,group) ) map[host][group]=true;
				else map[host][group]=false;
			}
		}
		$scope.hostGroupMap = map;
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
	//添加删除机器
	$scope.readyAddHost=function(){
		$scope.nowHost = {}
		$scope.nowHost.port = 22
		$("#hostNewHostModal").modal({});
	}
	$scope.addHost=function(){
		if( $scope.nowHost.hosts==null || $scope.nowHost.user==null ||
				$scope.nowHost.port==null || $scope.nowHost.passwd==null){
			alert("参数非法");
			return;
		}
		$http({
	        method: 'POST',
	        url: '/back/add_host',
	        params:{
	        	"hosts": $scope.nowHost.hosts.replace(new RegExp("\n","gm"),","),
	        	"user": $scope.nowHost.user,
	        	"port": $scope.nowHost.port,
	        	"passwd": $scope.nowHost.passwd,
	        	"sudopasswd":$scope.nowHost.sudopasswd
	        }
	    }).success(function(response, status, headers, config){
	    	if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    	else{
	    		$rootScope.beginProgress(response["runningId"],$scope.initHost);
	    	}
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
	$scope.readyDelHost=function(){
		$("#hostDelHostModal").modal({});
		$scope.chosenHost=$scope.getChosenHost();
	}
	$scope.getChosenHost=function(){
		ret=[];
		for(var host in $scope.chosenHost){
			if( $scope.chosenHost[host]) ret.push(host);
		}
		return ret.join(",");
	}
	$scope.delHost=function(){
		$http({
	        method: 'GET',
	        url: '/back/del_host',
	        params:{
	        	"hosts": $scope.chosenHost
	        }
	    }).success(function(response, status, headers, config){
	    	if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
		$scope.initHost()
	}
	//角色相关的函数
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
		for(var host in $scope.hostroles){
			var roleList = $scope.hostroles[host]['role']
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
	    	$rootScope.beginProgress(response["runningId"],$scope.initRole);
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
	//组相关的函数
	$scope.readySetupGroup=function(){
		var del=[];
		var add=[];
		console.log("ready group")
		console.log($scope.hostgroups)
		console.log($scope.groups)
		
		for(var host in $scope.hostgroups){
			var groupList = $scope.hostgroups[host]['group']
			for(var index in $scope.groups ){
				var group = $scope.groups [index];
				var oldRea = inArray(groupList,group);
				var newRea = $scope.hostGroupMap[host][group];
				if( oldRea && !newRea ){
					console.log(host+" "+group)
					del.push({"host":host,"group":group});
				}
				if( !oldRea && newRea ){
					console.log(host+" "+group)
					add.push({"host":host,"group":group});
				}
			}
		}
		$scope.addGroup=add;
		
		$scope.delGroup=del;
		$("#hostNewGroupModal").modal({});
	}
	$scope.setupGroup=function(){
		$http({
	        method: 'GET',
	        url: '/statics/static_data/setup_group.json',
	        params:  
        	{
        		"add" : angular.toJson($scope.addGroup),
        		"del" : angular.toJson($scope.delGroup)
        	}
	    }).success(function(response, status, headers, config){
	    	if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
		$scope.initGroup()
	}
}])


uhpApp.controller('TaskCtrl',['$scope','$rootScope','$http',function($scope,$rootScope,$http){
	$scope.columns=[{"name":"id","display":"id"},{"name":"sumbitTime","display":"提交时间"},
	                ];
	console.log($scope.columns);
	$scope.orderbyField = "id";
	$scope.orderDir = "desc";
	$scope.getIconClass=function(name){
		if( $scope.orderbyField == name){
			if( $scope.orderDir=="asc" ){
				return "icon-arrow-up";
			}
			else{
				return "icon-arrow-down";
			}
		}
		else return "";
	}
	$scope.changeOrderBy=function(name){
		if( $scope.orderbyField == name){
			if( $scope.orderDir =="asc" ){
				$scope.orderDir = "desc";
			}
			else{
				$scope.orderDir = "asc";
			}
		}
		else{
			$scope.orderbyField = name;
		}
		$scope.query();
	}
	$scope.query=function(){
		taskSearchText
		$http({
	        method: 'GET',
	        url: '/statics/static_data/tasks.json',
	        params:  
        	{
        		"search" : $scope.taskSearchText,
        		"orderby" : angular.toJson($scope.delService)
        	}
	    }).success(function(response, status, headers, config){
	    	if(response["ret"]!="ok"){
	        	alert("提交失败:"+response["msg"]);
	        }
	    	$rootScope.beginProgress(response["runningId"],$scope.initRole);
	    }).error(function(data, status) {
	    	alert("发送请求失败");
	    });
	}
}]);