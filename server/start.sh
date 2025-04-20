#!/bin/bash
if [ -z "$1" ]; then
    echo "using existing chatapi model"
else
    export CHATAPI_MODEL=$1
    echo "Argument provided: $1"
fi


# 기존 실행된 chatapi.mjs 프로세스 종료
kill  $(ps -ef | grep "node chatapi.mjs" | grep -v grep | awk '{print $2}')


sleep 1
# 새로운 프로세스 실행
node chatapi.mjs > api.log 2>  /dev/null  &

echo "chatapi.mjs 실행됨 (모델: $CHATAPI_MODEL)"
