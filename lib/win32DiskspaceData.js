var exec = require('child_process').exec;

// Returns an array of drives or calls callback 
exports.drives = function(callback) {
	var drives = [];	
			
	// Run command to get list of drives
	exec(
		'wmic logicaldisk get Caption,FreeSpace,Size,Description  /format:list',
		function (err, stdout, stderr) {
			if (err) 
				return callback(err);

			var aLines = stdout.split('\r\r\n');
			var bNew = false;
			
			// For each line get information
			// Format -> Key=Value
			for(var i = 0; i < aLines.length; i++) {
				if (aLines[i] != '') {
					var aTokens = aLines[i].split('=');
					switch (aTokens[0]) {
						case 'Caption':
							var driveData = {};
							driveData.drive = aTokens[1];
							bNew = true;
							break;
						case 'Description':
							driveData.filesystem = aTokens[1];
							break;
						case 'FreeSpace':
							driveData.available = parseFloat(aTokens[1]);
							break;
						case 'Size':
							driveData.total = parseFloat(aTokens[1]);
							break;
					}
				
				} else {
					// Empty line 
					// If we get an empty line and bNew is true then we have retrieved
					// all information for one drive, add to array and reset variables
					if (bNew) {
						if (isNaN(driveData.total))
							driveData.total = 0;

						if (isNaN(driveData.available))
							driveData.available = 0;
						
						driveData.used = (driveData.total - driveData.available);

						if (driveData.total != '' && driveData.total > 0)
							driveData.usedPer = Math.round((parseFloat(driveData.used) / driveData.total) * 100);
						else
							driveData.usedPer = 0;

						driveData.freePer = 100 - driveData.usedPer;

						// Push drive to drives
						drives.push(driveData);
						bNew = false;
					}
				}
			}

			callback(null, drives);
		}
	);
}