exports.isMonitoringModule = true;
exports.hasCron = true;

var njds = require('nodejs-disks');
var responseMessaging = require('monitor-response');

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
    njds.drives(
        function (err, drives) {
            njds.drivesDetail(
                drives,
                function (err, data) {
                    // for(var i = 0; i<data.length; i++)
                    // {
                    //     console.log(data[i].mountpoint); /* Get drive mount point */
                    //     console.log(data[i].total); /* Get drive total space */
                    //     console.log(data[i].used); /* Get drive used space */
                    //     console.log(data[i].available); /* Get drive available space  */
                    //     console.log(data[i].drive); /* Get drive name */
                    //     console.log(data[i].usedPer); /* Get drive used percentage */
                    //     console.log(data[i].freePer); /* Get drive free percentage */
                    // }

                    if(err)
                        callback(err);

                    callback(null, data);

                }
            );
        }
    )
}

var getDiskspace = function(req, res, next) {

    diskspaceData(function(err, data){
        if(err)
            res.json(responseMessaging.format(500, {}, [err]));
        else
            res.json(responseMessaging.format(200, data));  
    });

}