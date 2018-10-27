"use strict";

//worker内でスクリプト実行


var workerDB;
var vmTargetObj; //target
var vmMsg;
var vmArgs;
var me;
var changedStack = false;
var global = {username:""};
var inRunVm;

var linefeed = "\n";
var carriagereturn = "\r";
var formfeed = "\f";
var quote = "\"";
var true_ = true;
var false_ = false;

function vmExec(obj, msg, args){
	inRunVm = true;
	vmTargetObj = obj;
	var saveobj = me;
	me = obj;
	vmMsg = msg;
	vmArgs = args;
	var ret = null;

	try{
		ret = obj.exec[msg](args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	}catch(e){
		postMessage(obj.exec[msg]+"");
		postMessage(e.message);
	}
	me = saveobj;
	inRunVm = false;
	return ret;
}