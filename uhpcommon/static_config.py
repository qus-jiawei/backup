#!python
# coding=utf8

menus = [
         {"name":"admin", "display":"管理员", "href":"#admin"},
         {"name":"user", "display":"用户", "href":"#user"}
         ]

adminmenus = [
        {"name":"service", "display":"服务", "href":"#admin-service"},
        {"name":"host", "display":"机器", "href":"#admin-host"},
        {"name":"task", "display":"任务", "href":"#admin-task"},
        {"name":"history", "display":"历史", "href":"#admin-history"}
        ]

usermenus = []


services = [
    {"name":"zookeeper", 
     "actions":["start", "stop", "restart"], 
     "instanceActions":["start", "stop", "restart"]},
    {"name":"hdfs", 
     "actions":["start", "stop", "restart", "rollrestart"], 
     "instanceActions":["start", "stop", "restart"]},
    {"name":"yarn", 
     "actions":["start", "stop", "restart", "rollrestart"], 
     "instanceActions":["start", "stop", "restart"]}
    ]
