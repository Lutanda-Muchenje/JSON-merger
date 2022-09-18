#! /usr/bin/env node
var fs = require("fs");

//array of valid file names
let arrayOfFiles = [];
//array of all files in folder
let files = [];

//checking if user entered directory path parameters
if (process.argv.length === 2) {
	console.error("Specify a file path!");
	process.exit(1);
} else {
	//getting json files names
	files = fs.readdirSync(process.argv[2]);
	//checking if file is a valid json file
	for (let i = 0; i < files.length; i++) {
		if (files[i].split(".")[1] == "json") {
			arrayOfFiles.push(files[i]);
		}
	}

	//array for merged json files
	let mergedObject = {
		boards: [],
	};

	for (let i = 0; i < arrayOfFiles.length; i++) {
		//fetching json folder based on user parameters
		let rawdata = fs.readFileSync(
			"./" + process.argv[2] + "/" + arrayOfFiles[i]
		);

		//catching json input errors
		try {
			let student = JSON.parse(rawdata);
			//console.log(student);
			mergedObject["boards"].push(...student["boards"]);
		} catch (err) {
			console.log("WARNING: ERROR", err);
		}
	}
	//sorting json files first by vendor name then boards name
	try {
		let boards = mergedObject["boards"].sort(
			(a, b) => a.vendor.localeCompare(b.vendor) || a.name.localeCompare(b.name)
		);
	} catch (err) {
		console.log("WARNING: ERROR", err);
	}

	//importing empty metadata json file
	let meta = fs.readFileSync("metadatGenerator.json");
	let metaString = JSON.parse(meta);

	//Getting array of unique vendors
	const uniqueVendors = [...new Set(boards.map((item) => item.vendor))];
	//Getting array of unique boards
	const uniqueBoards = [...new Set(boards.map((item) => item.name))];

	//editing metadata to show number of vendors and boards
	try {
		metaString["_metadata"]["total_vendors"] = uniqueVendors.length;
		metaString["_metadata"]["total_boards"] = uniqueBoards.length;
	} catch (err) {
		console.log("WARNING: ERROR", err);
	}

	//returning merged json files and metadata as single json file
	console.log((mergedObject = { boards, ...metaString }));

	// convert JSON object to string
	const data = JSON.stringify(mergedObject);

	// write JSON string to a file
	fs.writeFile("merged.json", data, (err) => {
		if (err) {
			throw err;
		}
		console.log("JSON data is saved.");
	});
}
