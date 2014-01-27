#!python
#coding=utf8

import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker
from model.user import User
from model.task import Task
from model.instance import Instance
from model.host_group_var import Host,Group,GroupHost,HostVar,GroupVar
import sqlite3

import os  
import sys

connection = "sqlite:///D:\github\uhp\db\sqlite.db"

def getEngine():
    return create_engine(connection, echo=True)

def getSession():
    engine =  getEngine()
    Session = sessionmaker(bind=engine)
    session = Session()
    return session

def getConnect():
    engine =  getEngine()
    conn = engine.connect()
    return conn

def getCursor():
    conn = sqlite3.connect(connection) 
    return conn.cursor()

def createDB():
    engine = getEngine()
    User.metadata.create_all(engine) 
    Task.metadata.create_all(engine)
    Instance.metadata.create_all(engine)
    
    Host.metadata.create_all(engine)
    Group.metadata.create_all(engine)
    GroupHost.metadata.create_all(engine)
    GroupVar.metadata.create_all(engine)
    HostVar.metadata.create_all(engine)
    
    
def dropDB():
    engine = getEngine()
    User.metadata.drop_all(engine)
    Task.metadata.drop_all(engine)
    Instance.metadata.drop_all(engine)
    
    Host.metadata.drop_all(engine)
    Group.metadata.drop_all(engine)
    GroupHost.metadata.drop_all(engine)
    GroupVar.metadata.drop_all(engine)
    HostVar.metadata.drop_all(engine)
    
def createIndex():
    pass
    
def showAll():
    conn = sqlite3.connect(connection) 
    cursor = conn.cursor()
    #初始化
    cursor.execute('select * from groupvar');
    print cursor.fetchall()

def insert(object):
    session=getSession()
    session.merge(object)
    session.commit()
    
def insertInstance(service,host,role):
    session=getSession()
    instance=Instance(service,host,role)
    session.merge(instance)
    session.commit()

if __name__ == "__main__":
    dropDB()
    createDB()
    #showAll()
    insert(User("qus","123456","qiujw@ucweb.com"));
    insert(User("qus2","123456","qiujw@ucweb.com"));
    #机器
#     insert(Host("hadoop1"))
#     insert(Host("hadoop2"))
#     insert(Host("hadoop3"))
#     insert(Host("hadoop4"))
#     insert(Host("hadoop5"))
    #分组
    insert(Group("all","no chinise"))
    insert(Group("g1"))
    insert(Group("g2"))
     
    #分组和机器关系
    insert(GroupHost("g1","hadoop2"))
    insert(GroupHost("g1","hadoop3"))
    insert(GroupHost("g2","hadoop4"))
    insert(GroupHost("g2","hadoop5"))
    #分组变量
    insert(GroupVar("all","hdfs","fs_default_FS_string","50900"))
    insert(GroupVar("all","zookeeper","zookeeper_clientport","2181"))
    insert(GroupVar("all","hdfs","dfs_datanode_data_dir","/uhp/all_data_dir,/uhp/all_data_dir",1))
    insert(GroupVar("g1","zookeeper","zookeeper_clientport","2181"))
    insert(GroupVar("g1","hdfs","dfs_datanode_data_dir","/uhp/all_data_g1,/uhp/all_data_g1",1))
    #机器变量
    insert(HostVar("hadoop3","zookeeper","zoo_id","1"))
    insert(HostVar("hadoop4","zookeeper","zoo_id","2"))
    insert(HostVar("hadoop5","zookeeper","zoo_id","3"))
    #实例表数据
    insert(Instance("zookeeper","hadoop3","zookeeper"))
    insert(Instance("zookeeper","hadoop4","zookeeper"))
    insert(Instance("zookeeper","hadoop5","zookeeper"))
    insert(Instance("hdfs","hadoop2","namenode"))
    insert(Instance("hdfs","hadoop4","namenode"))
    insert(Instance("hdfs","hadoop2","datanode"))
    insert(Instance("hdfs","hadoop3","datanode"))
    insert(Instance("hdfs","hadoop4","datanode"))
    insert(Instance("hdfs","hadoop5","datanode"))
    insert(Instance("yarn","hadoop2","resourcemanager"))
    insert(Instance("yarn","hadoop2","nodemanager"))
    insert(Instance("yarn","hadoop3","nodemanager"))
    insert(Instance("yarn","hadoop4","nodemanager"))
    insert(Instance("yarn","hadoop5","nodemanager"))
    
#     showAll()

    

