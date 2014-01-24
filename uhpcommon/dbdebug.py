import database
import json
from model.instance import Instance
from sqlalchemy.orm import query,aliased

def getInstanceFromService():
    session=database.getSession()
    instances = session.query(Instance).filter(Instance.service == "zookeeper" )
    for instance in instances:
        print instance.service
    print instances
    
    
getInstanceFromService()