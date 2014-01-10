#!/bin/bash

if [ "$UHP_HOME" == "" ] ; then 
    echo "UHP_HOME is not set; " ;
    exit 1; 
fi


CONF=$UHP_HOME/conf

sudo yum install -y ansible

#检查ansible安装成功
RE=`ansible  --version|grep ansible|wc -l`
if [ "$RE" == "0" ] ; then
    echo "ansible not found" ;
    exit 1;
fi

#设置配置文件
sudo rm -rf /etc/ansible
sudo ln -s $CONF/ansible/ /etc/ansible

#安装python
echo "安装python-json"
ansible all -m raw -a 'yum -y install python-simplejson' -f 5 --sudo

echo "测试ansible"

ansible all -m ping
