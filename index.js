exports.isMonitoringModule = true;
exports.hasCron = true;
exports.snapshotData = true;

var os = require('os');
var numeral = require('numeral');
var njds = null;
var win32ds = require('./lib/win32DiskspaceData');

try {
	njds = require('nodejs-disks');
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
					else {
						// Convert strings to bytes
						data.available = numeral().unformat(data.available);
						data.total = numeral().unformat(data.total);
						data.used = numeral().unformat(data.used);

						callback(null, data);
					}
				}
			);
		}
	)
}

var win32DiskspaceData = function(callback) {
	win32ds.drives(function(err, aDrives) {
		if(err)
			callback(err);
		else
			callback(null, aDrives);
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