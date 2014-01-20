
###基本api

- 登录 post

        http://xxx.com/login?

    - 参数:
        user
        passwd
        
    - 返回
        {ret:"ok",msg:""}
        {ret:"error",msg:"passwd is not correct"}

- 登出 post

        http://xxx.com/logout?
    
    - 参数:
        user
    - 返回
        {ret:"ok",msg:""}
        {ret:"error",msg:"user is not login"}

###查询api

- 查询某个服务的概况 get/post
        
        http://xxx.com/service/info?
    - 参数:
        service={zookeeper,hdfs,yarn,hbase,hive}
    - 返回
        {ret:"ok",msg:"",info:"xxxxx"}
        {ret:"error",msg:"not login ",info:"xxxxx"}

- 查询服务的静态信息 get/post
        
        http://xxx.com/service/info?
    - 参数
    - 返回
        {ret:"ok",msg:"",info:{zookeeper:{xxxx},hdfs:{webui:{"namenode1":"hadoop2:59700"},action:[start,stop,restart,format],instanceaction:[start,stop,restart]}}}
        {ret:"error",msg:"not login ",info:"xxxxx"}

- 查询服务的运行的实例 get/post: 对应数据库的instance表
    
        http://xx.com/service/instance?

    - 参数: 
        service 
        
        

- 查询任务执行结果 get/post: 和datatable无缝结合。对应数据库的task表
    
        http://xx.com/service/query?

    - 参数: 
        iDisplayStart 起始条数
        iDisplayLength 结束条数
        iSortingCols 排序的列数
        bSortable_i iSortCol_i sSortDir_i 对应第N列需要排序，排序的方向 asc desc 。$i从0开始
        sSearch 全行搜索的字符串
        bSearchable_i sSearch_i 单独列是否允许搜索，要匹配的字符串
     
- 查询配置变量 conf/var: 对应ansible的变量 
    
        http://xx.com/service/query?

    - 参数: 
        service
        group_var 如果不为空，即是针对分组变量进行查询
        host_var 如果不为空，即是针对单个机器的变量进行查询
        
- 查询分组列表和host列表 conf/group_host: 对应ansible的变量 
    
        http://xx.com/service/query?

    - 参数: 
        service
        group_var 如果不为空，即是针对分组变量进行查询
        host_var 如果不为空，即是针对单个机器的变量进行查询

###操作api

- 针对服务提交一个任务 get/post:

        http://xx.com/service/action?
    
    - 参数：
        service 字符串可以是以下的一种zookeeper,hdfs,yarn,hbase,hive
        action  任务名称start,stop,restart...
    - 返回:
        {ret:"ok",msg:""}
        {ret:"error",msg:"not login "}
        
- 针对实例提交一个任务 get/post:

        http://xx.com/instance/action?
    
    - 参数：
        hosts 机器名
        roles 某一种角色
        action  任务名称start,stop,restart...
    - 返回:
        {ret:"ok",msg:""}
        {ret:"error",msg:"not login "}
        
- 