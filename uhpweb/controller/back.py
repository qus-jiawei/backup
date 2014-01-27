# -*- coding: UTF-8 -*-
import tornado
import static_config
import database
import json
from model.instance import Instance
from model.host_group_var import Host,Group,GroupHost,HostVar,GroupVar
from model.task import Task
from controller import BaseHandler
from sqlalchemy.orm import query,aliased
from sqlalchemy import and_
import async
import logging
import time
app_log = logging.getLogger("tornado.application")

class BackHandler(BaseHandler):
    
    @tornado.web.authenticated
    def get(self , path):
        if hasattr(self, path) :
            fun = getattr(self, path);
            if callable(fun):
                apply(fun)
        else:
            self.ret("error","unsupport action")
            
    @tornado.web.authenticated
    def post(self , path):
        self.get(path)
        
    def ret(self , status , msg , result={}):
        result["ret"] = status;
        result["msg"] = msg;
        self.write(tornado.escape.json_encode(result));
        
    def user(self):
        user = self.get_current_user();
        (menus,adminmenus,usermenus) = self.getMenus(user);
        ret = {"user":user,"menus":menus,"adminmenus":adminmenus,"usermenus":usermenus}
        self.ret("ok", "", ret);
        
    #根据用户获取权限
    def getMenus(self,user):  
        return (static_config.menus,static_config.adminmenus,static_config.usermenus);
    
    #获取所有服务的静态信息
    def services_info(self):
        ret={"services": static_config.services}
        self.ret("ok", "", ret);
        
    def service_info(self):
        service = self.get_argument("service")
        ret = { "name": service,"instances" : self.getInstance(service),"summary":self.getServiceSummary() }
        self.ret("ok", "", ret);
        
    def getInstance(self,service):
        session=database.getSession()
        instances = session.query(Instance).filter(Instance.service == service )
        ret=[];
        for instance in instances:
            ret.append(instance.format());
        return ret;
        
    def getServiceSummary(self):
        return "当前概况是XXXXXX"
    
    #获取所有的机器和组
    def group_host_list(self):
        session=database.getSession()
        groups = session.query(Group)
        ret={};
        temp=[];
        for group in groups:
            temp.append( {"name" : group.group});
        ret["groups"]=temp
        hosts = session.query(Host)
        temp=[];
        for host in hosts:
            temp.append( {"name" : host.hostname});
        ret["hosts"]=temp
        self.ret("ok", "", ret);
    
    #获取配置变量的接口 兼容组变量和机器变量，机器变量不过滤机器名称
    def conf_var(self):
        service = self.get_argument("service")
        group = self.get_argument("group","all")
        showType = self.get_argument("showType")
        temp = []
        if  showType=="group":
            session=database.getSession()
            groupVars = session.query(GroupVar).filter(and_( GroupVar.service == service , GroupVar.group == group ) )
            
            for groupVar in groupVars:
                print groupVar
                temp.append( groupVar.format() );
        else:
            session=database.getSession()
            hostVars = session.query(HostVar).filter( HostVar.service == service )
            for hostVar in hostVars:
                temp.append( hostVar.format() );
                
        self.ret("ok", "", {"conf":temp})
    
    #保存 修改 删除  分组变量或者机器变量
    #TODO增加区分是否第一次插入
    def save_confvar(self):
        service = self.get_argument("service")
        showType = self.get_argument("showType")
        group = self.get_argument("group","")
        host = self.get_argument("host","")
        name = self.get_argument("name")
        value = self.get_argument("value")
        type = self.get_argument("type")
        text = self.get_argument("text")
        showdel = self.get_argument("del","")
        if  showType=="group":
            groupVar = GroupVar(group,service,name,value,type,text)
            if showdel=="del":
                session=database.getSession()
                for groupVar in session.query(GroupVar).filter( and_( GroupVar.service == service , GroupVar.group == group , GroupVar.name == name )) :
                    session.delete(groupVar)
                session.commit()
            else:
                session=database.getSession()
                session.merge(groupVar)
                session.commit()
           
        else:
            hostVar = HostVar(host,service,name,value,type,text)
            session=database.getSession()
            if showdel=="del":
                session=database.getSession()
                for hostVar in session.query(HostVar).filter( and_( HostVar.service == service , HostVar.host == host , HostVar.name == name )) :
                    session.delete(hostVar)
                session.commit()
            else:
                session=database.getSession()
                session.merge(hostVar)
                session.commit()
                
        self.ret("ok", "", {})
    
    #提交一个执行任务 
    def send_action(self):
        taskType = self.get_argument("taskType",1)
        service = self.get_argument("service")
        actionType = self.get_argument("actionType")
        instances = self.get_argument("instances","")
        taskName = self.get_argument("taskName")
        runningId = []
        session = database.getSession()
        if actionType=="service":
            #针对服务的操作
            task = Task(taskType,json.dumps({"service":service}),taskName);
            session.add(task)
            session.flush()
            runningId.append(id)
        elif actionType=="instance":
            for instance in instances.split(","):
                temp = instance.split("-")
                app_log.info(instance)
                if len(temp) == 2 :
                    host = temp[0]
                    role = temp[1]
                    task = Task(taskType,json.dumps({"host":host,"role":role}),taskName);    
                    session.add(task)
                    session.flush()
                    runningId.append(task.id)
        else:
            self.ret("error", "unsport actionType")
        session.commit();
        self.ret("ok", "", {"runningid": runningId})
    
    #添加一个机器
    def add_host(self):  
        hosts = self.get_argument("hosts")
        port = self.get_argument("port")
        user = self.get_argument("user")
        passwd = self.get_argument("passwd")
        sudopasswd = self.get_argument("sudopasswd")
        id = async.async_setup()
        hostArray = hosts.split(",")
        async.async_run(async.add_host,(id,hostArray,port,user,passwd,sudopasswd))
        self.ret("ok", "", {"runningId": [id]})
        
    #查询进度
    def query_progress(self):
        id = self.get_argument("id")
        ids = json.loads(id)
        progress = 0;
        progressMsg = "";
        for nid in ids:
            (pg,msg) = self.query_id_process(nid)
            if nid < 0:
                progressMsg += "同步任务 taskid: ("+str(-nid)+") "+msg+"\n";
            else:
                progressMsg += "异步后台任务 taskid: ("+str(nid)+") "+msg+"\n";
            progress += int(pg)
        progress /= len(ids)
        self.ret("ok", "", {"id": ids,"progress":progress,"progressMsg":progressMsg } )
    
    def query_id_process(self,id):
        if id <0 :
            #同步任务
            return (async.async_get(id,"progress","0"),async.async_get(id,"progressMsg",""))
        else:
            #worker 任务
            return (100,"haha")
    
    #获取机器列表
    def hosts(self):
        session=database.getSession()
        hosts = session.query(Host)
        ret={}
        for host in hosts:
            ret[host.hostname]={"info":host.format()}
        self.ret("ok", "", {"hosts":ret})
        
        
    def del_host(self):
        hosts = self.get_argument("hosts")
        session=database.getSession()
        queryHosts = session.query(Host).filter(Host.hostname.in_(hosts.split(",")))
        for host in queryHosts:
            session.delete(host)
        session.commit()
        self.ret("ok", "")
        
    #添加删除服务
    def setup_service(self):
        addSer = self.get_argument("add")
        delSer = self.get_argument("del")
        
    #查询任务
    def task(self):
        sSearch = self.get_argument("sSearch","")
        iSortingCols = self.get_argument("iSortingCols","0")
        result={""}
        self.write(tornado.escape.json_encode(result));
#         dt = DataTableQuery(self,"task",["id","taskType","object","task","status","result"],"id")
#         dt.runQueries()
#         dt.outputResult()