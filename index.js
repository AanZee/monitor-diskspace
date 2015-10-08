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
	diskspaceData(function(err, drives){
		if(err)
			callback(err);
		else
			callback(null, drives);
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
		function (err, driveNames) {
			njds.drivesDetail(
				driveNames,
				function (err, drives) {
					if(err)
						callback(err);
					else {
						drives.forEach(function(drive) {
							// Convert strings to bytes
							drive.available = numeral().unformat(drive.available);
							drive.total = numeral().unformat(drive.total);
							drive.used = numeral().unformat(drive.used);

							// Convert strings to numbers
							drive.freePer = parseFloat(drive.freePer);
							drive.usedPer = parseFloat(drive.usedPer);
						});

						callback(null, drives);
					}
				}
			);
		}
	)
}

var win32DiskspaceData = function(callback) {
	win32ds.drives(function(err, drives) {
		if(err)
			callback(err);
		else
			callback(null, drives);
	});
}

// var getDiskspace = function(req, res, next) {

//  diskspaceData(function(err, drives){
//      if(err)
//          res.json(responseMessaging.format(500, {}, [err]));
//      else
//          res.json(responseMessaging.format(200, drives));  
//  });

// }