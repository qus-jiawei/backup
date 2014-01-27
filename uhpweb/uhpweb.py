#!/usr/bin/env python
# coding:utf-8
import os.path, logging, sys
# homedir=os.path.join( os.getenv('UHP_HOME'),"uhpcommon");
homedir="D:\github\uhp\uhpcommon"
sys.path.append(homedir)
import database

import tornado.httpserver
import tornado.ioloop
import tornado.web

from tornado.options import define, options

from controller import *
from controller.back import BackHandler
from controller.debug import DebugHandler
from sqlalchemy import create_engine


access_log = logging.getLogger("tornado.access")
app_log = logging.getLogger("tornado.application")
gen_log = logging.getLogger("tornado.general")

define("config", default='/etc/uhp/uhpweb.conf', help="The uhpweb config file", type=str)
define("bind_host", default='0.0.0.0', help="The uhp-web bind host ip", type=str)
define("bind_port", default='59990', help="The uhp-web listening port", type=int)
define("logfile", default='uhpweb.log', help="The uhpweb log file name", type=str)
define("log_dir", default='/home/hadoop/uhp/log/uhpweb', help="The uhpweb log dir", type=str)
define("logformatter", default='(%(name)s): %(asctime)s %(levelname)s %(module)s %(funcName)s %(message)s', help="The uhpweb log formatter", type=str)

def parse_config_file(conf_file):
    if not conf_file:
        conf_file = "/etc/uhp/uhpweb.conf"
    conf_file_other = "etc/uhpweb.conf"
    if os.path.exists(conf_file):
        options.parse_config_file(conf_file)
        gen_log.info("Load config file from %s" %(conf_file))
    elif os.path.exists(conf_file_other):
        options.parse_config_file(conf_file_other)
        gen_log.info("Load config file from %s" %(conf_file_other))
    else:
        gen_log.error("Cant load the config file from %s or %s" % (conf_file, conf_file_other))

def set_log(target_log, log_type):
    fileHandler = logging.FileHandler("%s/%s_%s" %(options.log_dir, log_type, options.logfile,))
    formatter = logging.Formatter(options.logformatter)
    fileHandler.setFormatter(formatter)
    target_log.addHandler(fileHandler)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/", IndexHandler),
            (r"/login", LoginHandler),
            (r"/home", HomeHandler),
            (r"/back/(.*)", BackHandler),
            (r"/debug", DebugHandler),
            (r"/logout", AuthLogoutHandler),
            (r'/statics/(.*)', tornado.web.StaticFileHandler, {'path':os.path.join(os.path.dirname(__file__), "statics")})
        ]
        settings = dict(
            app_title=u"uhpweb",
            template_path=os.path.join(os.path.dirname(__file__), "app"),
            static_path=os.path.join(os.path.dirname(__file__), "statics"),
            xsrf_cookies=False,
            cookie_secret="FS24FADSDSFDS$^&$$DJFHSJFDF",
            login_url="/login",
            debug=True,
        )
        tornado.web.Application.__init__(self, handlers, **settings)
        
        self.engine = database.getEngine();


def main(config_file):
    parse_config_file(config_file)
    set_log(access_log, "access")
    set_log(app_log, "app")
    set_log(gen_log, "gen")

    http_server = tornado.httpserver.HTTPServer(Application())
    http_server.listen(options.bind_port, address=options.bind_host)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    options.parse_command_line(sys.argv)
    config_file = options.config
    main(config_file)
