# -*- coding: UTF-8 -*-
import tornado
import static_config
import database
from model.instance import Instance
from controller import BaseHandler
from sqlalchemy.orm import query,aliased

class BackHandler(BaseHandler):
    
    @tornado.web.authenticated
    def get(self , path):
        if hasattr(self, path) :
            fun = getattr(self, path);
            if callable(fun):
                apply(fun)
        else:
            self.ret("error","unsupport action")
        
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
            #TODO
            ret.append(instance.format());
        return ret;
        
    def getServiceSummary(self):
        return "当前概况是XXXXXX"
        
        
        