# -*- coding: UTF-8 -*-
from sqlalchemy import Column, Integer, String, Text, schema
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import ForeignKey, DateTime, Boolean, func
from sqlalchemy.orm import relationship, backref
from models import UHPBase

BASE = declarative_base()

class User(BASE, UHPBase):
    """ users tables for uhpkeeper """

    __tablename__ = 'user'

    id= Column(Integer, primary_key=True)
    name= Column(String(30), nullable=False, unique=True)
    password= Column(String(30), nullable=False)
    email= Column(String(60), nullable=True)

    def __init__(self, name, password, email):
        self.name = name
        self.password = password
        self.email = email
