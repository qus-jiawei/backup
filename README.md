uc-hadoop-platform
==================

命令行安装步骤：

1. git clone到机器上
2. 修改conf中的配置文件，其中几个关键的修改地方
	
	- conf/group_vars/all:
			
		- ssh配置
			
			ansible_ssh_port ssh端口
			ansible_sudo_pass 用户sudo的密码
			
		- java安装包配置(如果已经安装sun的java1.6以上，可以忽略)
			
			#安装包位置
			java_tar: /home/xxx/xx/jdk1.6.0_45.tar.gz
			#解压后的目录名称
			java_untar_floder: jdk1.6.0_45
		
		- 机器目录配置
		
			dfs_datanode_data_dir为datanode的默认数据目录
			yarn_nm_local_dirs为yarn的nodemanager的本地数据目录
			yarn_nm_log_dirs为yarn的nodemanager的本地日志目录
		
			由于实际生产环节中，根据磁盘目录不同这3个的目录都不尽相同。
			所以可以通过组变量或者机器变量实现覆盖。
			详情可参考：
			[Inventory](http://docs.ansible.com/intro_inventory.html#host-variables)
		
		- 机器角色配置
		
			conf/hosts：里面定义了大量的机器组的角色请按照实际情况修改
			如果没有对应的角色可以留空，请不要删除该分组
		
3. 运行bin/setup_ansible.sh 安装ansible。并创建软连接，将/etc/ansible连接到本项目的conf/ansible

4. 如果要安装本地仓库，请参看下文安装本地仓库

5. 分发仓库文件 ansible-playbook ansible/prepare/depoly_repo.yml

6. 安装基本配置(ulimit安装 java安装) ansible-playbook ansible/prepare/prepare.yml

7. 安装
	
		ansible-playbook ansible/service/setup_zookeeper.yml
		ansible-playbook ansible/service/setup_hadoop.yml
		ansible-playbook ansible/service/setup_hbase.yml
		ansible-playbook ansible/service/setup_hive.yml
		ansible-playbook ansible/service/setup_client.yml
		
8. 配置部署
	
		ansible-playbook ansible/service/conf_hadoop.yml
		ansible-playbook ansible/service/conf_hbase.yml
		ansible-playbook ansible/service/conf_hive.yml
		ansible-playbook ansible/service/conf_client.yml
		
9. 初始化脚本
		
		ansible-playbook ansible/service/init_hdfs.yml //初始化文件系统的目录
		ansible-playbook ansible/service/init_hive.yml //初始化hive的mysql

10. 服务启动脚本		

		详见各start和stop脚本

11. 安装本地仓库:

		运行ansible-playbook uhp/ansible/prepare/create_local_repo.yml
		会下载RPM包，并放入到指定的http的root目录。
	