const kid = require('child_process');
const ps = require('ps-node');

console.log('Checking to see if mongod already running!');
ps.lookup({ command: 'mongod' }, function(e, f) {
    if (!f.length) {
        //database not already running, so start it up!
        kid.exec('c: && cd c:\\mongodb\\bin && start mongod -dbpath "d:\\data\\mongo\\db" && pause', function(err, stdout, stderr) {
            if (err){ console.log('Uh oh! An error of "', err, '" prevented the DB from starting!');}else{
            	kid.exec('nodemon app.js')
            }
        })
    } else {
        console.log('mongod running!')
    }
})