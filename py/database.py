#!python
# coding=utf8

import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import sessionmaker
from db.user import User
import sqlite3
from etc import config


def getEngine():
    return create_engine(config.connection, echo=True)

def getSession():
    engine =  getEngine()
    Session = sessionmaker(bind=engine)
    session = Session()
    return session

def getCursor():
    conn = sqlite3.connect(config.connection) 
    return conn.cursor()

def createDB():
    engine = getEngine()
    User.metadata.create_all(engine) 

    
def dropDB():
    engine = getEngine()
    User.metadata.drop_all(engine)
    
def createIndex():
    conn = sqlite3.connect(config.connection) 
    cursor = conn.cursor()
#     cursor.execute('CREATE INDEX IF NOT EXISTS nm_happen_host ON nm(happenTime,host);');
    
def showAll():
    conn = sqlite3.connect(config.connection) 
    cursor = conn.cursor()
    #初始化
    cursor.execute('select * from user limit 10');
    print cursor.fetchall()

def insertUser(name,passwd,email):
    session=getSession()
    user=User(name,passwd,email)
    session.merge(user)
    session.commit()

if __name__ == "__main__":
    #dropDB()
    #createDB()
    #showAll()
    insertUser("qus","123456","qiujw@ucweb.com")

