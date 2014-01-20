#!python
# coding=utf8

import sqlalchemy
from sqlalchemy import create_engine
from conf import config
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker
from user import User
import sqlite3

def getEngine():
    return create_engine('sqlite:///'+config.sqlitepath, echo=True)

def getSession():
    engine =  getEngine()
    Session = sessionmaker(bind=engine)
    session = Session()
    return session

def getCursor():
    conn = sqlite3.connect(config.sqlitepath) 
    return conn.cursor()

def createDB():
    engine = getEngine()
    User.metadata.create_all(engine) 

    
def dropDB():
    engine = getEngine()
    User.metadata.drop_all(engine)
    
def createIndex():
    conn = sqlite3.connect(config.sqlitepath) 
    cursor = conn.cursor()
#     cursor.execute('CREATE INDEX IF NOT EXISTS nm_happen_host ON nm(happenTime,host);');
#     cursor.execute('CREATE INDEX app_finish ON app(finishedTime);');
    
def showAll():
    conn = sqlite3.connect(config.sqlitepath) 
    cursor = conn.cursor()
    #初始化
    cursor.execute('select * from user limit 10');
    print cursor.fetchall()
# class User(Base):
#     __tablename__ = 'users'
#     id = Column(Integer, primary_key=True)
#     name = Column(String)
#     fullname = Column(String)
#     password = Column(String)
#      
#     def __init__(self, name, fullname, password):
#         self.name = name
#         self.fullname = fullname
#         self.password = password
# 
#     def __repr__(self):
#         return "<User('%s','%s', '%s')>" % (self.name, self.fullname, self.password)
#     
# engine = create_engine('sqlite:///'+config.sqlitepath, echo=True)
# engine.execute("select 1").scalar()

if __name__ == "__main__":
    dropDB()
    createDB()
    showAll()
#     engine = create_engine('sqlite:///'+config.sqlitepath, echo=True)
#     
#     Session = sessionmaker(bind=engine)
#     session = Session()
# #     session = getSession()
#     ar = applicationRecord()
#     ar.metadata.create_all(engine) 
         
#     print ar.__table__
#     session.add(ar)
# #     session.flush()
#     session.commit()
#     session.close()