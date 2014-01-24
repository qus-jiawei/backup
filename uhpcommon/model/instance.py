# -*- coding: UTF-8 -*-
from sqlalchemy import Column, Integer, String, Text, schema,SmallInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship, backref
from models import UHPBase
import time

BASE = declarative_base()


class Instance(BASE, UHPBase):
    """ users tables for uhpkeeper """

    __tablename__ = 'instance'

    id= Column(Integer, primary_key=True)
    service = Column(String(16), nullable=False)
    hostname = Column(String(32), nullable=False)
    role = Column(String(16), nullable=False)
    #网络机架
    rack = Column(String(32), nullable=False)
    # 0-未启动,1-启动
    status = Column(SmallInteger, nullable=False)
    # 0-未知,1-健康，2-不健康,3-宕机
    health = Column(SmallInteger, nullable=False)
    #拓展字段 json格式
    more = Column(String(64), nullable=False)
    uptime = Column(Integer)
    

    def __init__(self, service, hostname, role):
        self.service = service
        self.hostname = hostname
        self.role = role
        self.rack = "default"
        self.status = 0
        self.health = 0
        self.more = "{}"
        self.uptime = 0
    
    status_map=["未启动","启动"]
    health_map=["未知","健康","不健康","宕机"]
    
    
    #转化字段为最终可以显示的字段
    def format(self):
        ret={};
        ret["service"] = self.service;
        ret["name"] = "%s(%s)"%(self.hostname,self.role)
        ret["host"] = self.hostname;
        ret["role"] = self.role;
        ret["rack"] = self.rack;
        ret["status"] = Instance.status_map[self.status];
        ret["health"] = Instance.health_map[self.health];
        if self.uptime == 0 :
            ret["uptime"] = "0000-00-00 00:00:00"
        else:
            timeArray = time.localtime(ret["time"])
            ret["uptime"] = time.strftime("%Y-%m-%d %H:%M:%S", timeArray)
        return ret;
            
