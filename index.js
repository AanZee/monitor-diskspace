exports.isMonitoringModule = true;
exports.hasCron = true;
exports.snapshotData = true;

var os = require('os');
var njds = null;
var diskinfo = null;

try {
	njds = require('nodejs-disks');
} catch(e) {}
try {
	diskinfo = require('diskinfo');
} catch(e) {}

exports.getRoutes = function () {
	return [
		{method: 'GET', pattern: '/diskspace', function: getDiskspace}
	];
}

exports.executeCron = function (callback) {
	diskspaceData(function(err, data){
		if(err)
			callback(err);
		else
			callback(null, data);
	});
}

var diskspaceData = function(callback){
	switch (os.platform().toLowerCase()) {
		case 'win32':
			win32DiskspaceData(callback);
			break;
		
		case 'linux':
			linuxDarwinDiskspaceData(callback);
			break;

		case 'darwin':
			linuxDarwinDiskspaceData(callback);
			break;
	}
	
}

var linuxDarwinDiskspaceData = function(callback) {
	njds.drives(
		function (err, drives) {
			njds.drivesDetail(
				drives,
				function (err, data) {
					if(err)
						callback(err);
					else
						callback(null, data); // TODO: Change data to readable bytes
				}
			);
		}
	)
}

var win32DiskspaceData = function(callback) {
	diskinfo.getDrives(function(err, aDrives) {
		if(err)
			callback(err);
		else
			callback(null, data); // TODO: Change data structure and data to readable bytes
	});
}

// var getDiskspace = function(req, res, next) {

//  diskspaceData(function(err, data){
//      if(err)
//          res.json(responseMessaging.format(500, {}, [err]));
//      else
//          res.json(responseMessaging.format(200, data));  
//  });

// }