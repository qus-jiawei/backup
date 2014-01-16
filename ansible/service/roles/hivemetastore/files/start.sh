#!/bin/bash

function check_start(){
  status=`service hive-metastore status`
  
  if [[ "$status" =~ "metastore is running" ]] ;
  then
    echo "0"
  else
    echo "1"
  fi;
}

now=`check_start`

if [ "$now" == "1" ];
then
    service hive-metastore start 
    exit `check_start`
fi;
