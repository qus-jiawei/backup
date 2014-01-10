#!/bin/bash

CONF=$UHP_HOME/conf
BIN=$UHP_HOME/bin
src=$UHP_HOME/src
BUILD=$UHP_HOME/build
PB=$UHP_HOME/src/playbook

. $CONF/helper.sh

#搭建HTTP服务器,默认自动安装和使用nginx.
#如果已经有HTTP服务器，请设置变量
#INSTALL_NGINX=false
#并填写以下变量
#REPO_HTTP_UTL=http://xxx:8765 （填写HTTP访问的URL，请和HTTP_SERVER_ROOT对应的目录一致）
#HTTP_SERVER_ROOT=/usr/share/nginx/html （指向你配置的nginx的目录）
#将会跳过安装HTTP服务器步骤

#是否自动搭建HTTP服务器
INSTALL_NGINX=false

#YUM访问的URL
REPO_HTTP_URL=http://hadoop2:60000

#HTTP服务的ROOT目录，程序将在这里创建仓库
HTTP_SERVER_ROOT=/usr/share/nginx/html/

