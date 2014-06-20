// ROS MSG JS
// parse ros message into json format

// namespace
var ROSMSG = ROSMSG || new Object();
// required libraries
var fs = require('fs');

// parse the directory, and output to output directory
ROSMSG.parse = function (dir, output) {
	// default output directory
	output = output || "output";
	var files = ROSMSG.getFiles(dir);
	var msg_list = new Array();
	for (var i in files) {
		// find .msg files
		if (files[i].substr(-4) == ".msg") {
			var path = files[i].split("/");
			// find file name without path or extension
			var filename = path[path.length - 1].substring(0, path[path.length - 1].length - 4);
			var msg = ROSMSG.parseMsg(files[i]);
			// write msg json to file
			fs.writeFile(output + "/" + filename + ".json", JSON.stringify(msg, null, 4), function(err) {
				if (err) {
					console.log(err);
				}
			});
			msg_list.push(msg);
		}
	}
	// write the entire msg list into file
	fs.writeFile(dir + ".json", JSON.stringify(msg_list, null, 4), function(err) {
		if (err) {
			console.log(err);
		}
	});
	return msg_list;
};
// get a list of file names in a directory
ROSMSG.getFiles = function (dir) {
	var filenames = new Array();
	var files = fs.readdirSync(dir);
	for (var i in files) {
		if (! files.hasOwnProperty(i)) {
			continue;
		}
		var name = dir + '/' + files[i];
		// if directory
		if (fs.statSync(name).isDirectory()) {
			// recursive
			filenames = filenames.concat( ROSMSG.getFiles(name) );
		}
		else {
			filenames.push(name);
		}
	}
	return filenames;
};
// parse a msg type to json
ROSMSG.parseMsg = function (file) {
	var data = fs.readFileSync(file, "utf8");
	var lines = data.split("\n");
	// record file name in json
	var msg = {
		"$file": file,
	};
	for (var i in lines) {
		if (0 == lines[i].length) {
			continue;
		}
		// comment lines, save to json # key
		if ("#" == lines[i][0]) {
			ROSMSG.addToJson(msg, "#", lines[i].substr(1));
		}
		else {
			var words = lines[i].split(/\s+/);
			var type;
			// find the msg type
			for (var j in words) {
				if ("" != words[j]) {
					type = words[j];
					break;
				}
			}
			// invalid type
			if (undefined === type || "" == type || " " == type) {
				continue;
			}
			lines[i] = lines[i].substring(type.length);
			// find constant by =
			var c = lines[i].indexOf("=");
			var constant;
			if (-1 == c) {
				constant = "";
			}
			else {
				constant = lines[i].substring(c + 1);
				lines[i] = lines[i].substring(0, c);
			}
			// find inline comment by #
			c = lines[i].indexOf("#");
			var comment;
			if (-1 == c) {
				comment = "";
			}
			else {
				comment = lines[i].substring(c + 1);
				lines[i] = lines[i].substring(0, c);
			}
			// find the msg name
			var name = lines[i].trim();
			msg[name] = {
				type: type,
				comment: comment,
				constant: constant
			};
		}
	}
	return msg;
};
// add an item to json considering key duplication
ROSMSG.addToJson = function (json, key, value) {
	if (key in json) {
		// if array exists
		if (typeof json[key] == "array" || typeof json[key] == "object") {
			json[key].push(value);
		}
		else {
			var old = json[key];
			// create an array for duplicate items, but actually it is an object
			json[key] = new Array();
			json[key].push(old);
			json[key].push(value);
		}
	}
	else {
		// no duplicate
		json[key] = value;
	}
	return json;
}

ROSMSG.parse("common_msgs");
