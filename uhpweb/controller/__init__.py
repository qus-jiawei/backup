# -*- coding: UTF-8 -*-
import tornado

from sqlalchemy.orm import sessionmaker
from sqlalchemy import and_
from model.user import User

session = None

class BaseHandler(tornado.web.RequestHandler):
    session = None

    @property
    def engine(self):
        return self.application.engine

    def getseesion(self, new=False):
        """ if new is True then create a new session otherwise return the global one """
        if new:
            return sessionmaker(bind=self.application.engine)()
        if not BaseHandler.session:
            BaseHandler.session = sessionmaker(bind=self.application.engine)()
        return BaseHandler.session

    def get_current_user(self):
        user = self.get_secure_cookie("user")
        if not user: return None
        return  tornado.escape.json_decode(user)
    
    def set_current_user(self, user):
        if user:
            self.set_secure_cookie("user", tornado.escape.json_encode(user))
        else:
            self.clear_cookie("user")

class LoginHandler(BaseHandler):
    def get(self):
        self.render("login.html", title="uhp管理平台")

    def post(self):
        username = self.get_argument('useranme')
        password = self.get_argument('password')
        user = self.getseesion().query(User).filter(and_(User.name == username, User.password == password)).first()

        if user:
            self.set_current_user({'name': user.name, 'password': user.password})
            self.redirect("/home")
        else:
            self.redirect('/login')

class HomeHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("home.html")

class IndexHandler(BaseHandler):
    def get(self):
        self.redirect('/login')

class AuthLogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.redirect("/login")
