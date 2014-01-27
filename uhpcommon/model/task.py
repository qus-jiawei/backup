# -*- coding: UTF-8 -*-
from sqlalchemy import Column, Integer, String, Text, schema,SmallInteger
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship, backref
from models import UHPBase
import json

BASE = declarative_base()

STATUS_INIT=0
STATUS_PENDING=1
STATUS_RUNNING=2
STATUS_FINISH=3

RESULT_UNFINISH=0
RESULT_SUCCESS=1
RESULT_FAILED=2
RESULT_TIMEOUE=3

class Task(BASE, UHPBase):
    """ users tables for uvpkeeper """

    __tablename__ = 'task'
    #mysql自增id
    id= Column(Integer, primary_key=True)
    #任务类型   1:ansible 2:shell
    taskType = Column(SmallInteger, nullable=False)
    #任务对象  格式为 json {service:xxxx} {group:xxxx,role:xxx} {host:xxxx,role:xxx}
    object = Column(String(64), nullable=False)
    #任务名称 start stop restart ...
    task = Column(String(30), nullable=False)
    #任务需要的参数 json格式
    params = Column(String(256))
    #任务状态  0-初始  1-待运行 2-运行中 3-运行结束
    status = Column(SmallInteger, nullable=False)
    #任务结果  0-未完成  1-成功 2-失败 3-超时
    result = Column(SmallInteger, nullable=False)
    #附加信息 填写运行失败的时候的错误提示
    msg = Column(Text)

    def __init__(self, taskType, object, task, params = "{}"):
        self.taskType = taskType
        self.object = object
        self.task = task
        self.params = params
        self.status = STATUS_INIT
        self.result = RESULT_UNFINISH
        
        