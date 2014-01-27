import database
import json
from model.instance import Instance
from model.task import Task
from sqlalchemy.orm import query,aliased

def getdb():
    session=database.getSession()
    task = Task("1","2","3")
    session.add(task)
    session.flush()
    print task.id
    session.commit()
    objects = session.query(Task)
    for object in objects:
        print object.id,object.task
    print objects
    
    
getdb()