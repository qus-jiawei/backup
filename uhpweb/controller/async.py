# -*- coding: UTF-8 -*-
import time  
import thread 
import threading
import database
from model.host_group_var import Host

mutex = threading.Lock()
cache = {}
asyncid = 0

def async_run(fun,obj):
    thread.start_new_thread(fun,obj)

def async_setup():
    mutex.acquire()
    global asyncid 
    global cache
    asyncid -= 1
    id = asyncid
    if not cache.has_key(id) :
        cache[id] = {}
    mutex.release()
    return id;
    
def async_set(id,name,value):
    mutex.acquire()
    global cache
    cache[id][name]=value
    mutex.release()

def async_get(id,name,default):
    #锁定
    temp = ""
    mutex.acquire()
    global cache
    if cache.has_key(id) and cache[id].has_key(name):
        temp = cache[id][name]
    mutex.release()
    if temp=="" :
        return default;
    return temp

def async_remove(id):
    mutex.acquire()
    global cache
    cache.pop(id)
    mutex.release()
    
def add_host(id,hosts,user,port,passwd,sudopasswd):  
    async_set(id,"progressMsg","begin to run")
    async_set(id,"progress","10")
    time.sleep(2)
    async_set(id,"progressMsg","ssh to")
    async_set(id,"progress","20")
    time.sleep(2)
    async_set(id,"progressMsg","get info")
    async_set(id,"progress","80")
    time.sleep(2)
    async_set(id,"progressMsg","finish")
    async_set(id,"progress","100") 
    #保留10秒后清除
    session=database.getSession()
    for hostName in hosts:
        host = Host(hostName)
        host.ip="192.168.1.1"
        host.cpu="fade8core"
        host.mem="fade100G"
        host.disk="fade100T"
        host.rack="unknow"
        session.add(host)
        session.commit()
    time.sleep(10)
    async_remove(id)
      