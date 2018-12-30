const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const uuidv4 = require('uuid/v4');
const favicon = require('serve-favicon');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const datasourcePath = __dirname + '/app/data/location_history.json';
const fitnessDatasourcePath = __dirname + '/app/data/fitness.json';
const foodDatasourcePath = __dirname + '/app/data/food.json';
const http = require("http");

function prettyStringify(json) {
	var result = JSON.stringify(json,function(k,v){
		if (k === 'data' ) return v;
		if (k === 'locations' ) return v;
		if(v instanceof Array) return JSON.stringify(v);
		return v;
	},2).replace(/\\"/g, '"').replace(/"\[/g, '[').replace(/]"/g, ']');
	
	return result;
}

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'app/views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'app/views'))
app.get('/', (request, response) => { response.render('home') })
app.get('/pomodoro', (request, response) => { response.render('pomodoro') })
app.get('/fitness', (request, response) => { response.render('fitness') })
app.get('/food', (request, response) => { response.render('food') })
app.get('/labels', (request, response) => { response.render('labels') })

app.use("/app", express.static(__dirname + '/app'));
app.use("/app/js", express.static(__dirname + '/app/js'));
app.use("/app/data", express.static(__dirname + '/app/data'));
app.use(favicon(path.join(__dirname, '/app/images', 'favicon.ico')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/poi', function (req, res) {
	var query = req.body;
	var file = require(datasourcePath);
	var id = uuidv4();
	var newLoc = {
		"id" : id,
		"name" : query.name,
		"lat" : query.lat,
		"lng" : query.lng,
		"link" : query.link
	};
	file.locations.push(newLoc);
	
	fs.writeFile(datasourcePath, prettyStringify(file), function (err) {
	  if (err) return console.log(err);
	});
	res.status(200).send({ id: id });
})

app.delete('/poi', function (req, res) {
	var query = req.body;
	var file = require(datasourcePath);
	for(var i = 0; i < file.locations.length; i++)
	{
		if(file.locations[i].id == query.id)
		{
			file.locations.splice(i, 1);
			break;
		}
	}
	
	fs.writeFile(datasourcePath, prettyStringify(file), function (err) {
	  if (err) return console.log(err);
	});
	res.sendStatus(200);
})

app.post('/updateFoodItem', function (req, res) {
	var query = req.body;
	
	var file = require(foodDatasourcePath);
	
	for(var i = 0; i < file.data.length; i ++)
	{
		if(file.data[i][0] == query[0])
		{
			file.data[i][3] = query[3];
		}
	}
	
	fs.writeFile(foodDatasourcePath, prettyStringify(file), function (err) {
	  if (err) return console.log(err);
	});

	res.sendStatus(200);
})

app.post('/updateFitnessItem', function (req, res) {
	var query = req.body;
	
	var file = require(fitnessDatasourcePath);
	
	for(var i = 0; i < file.data.length; i ++)
	{
		if(file.data[i][0] == query[0])
		{
			file.data[i][3] = query[3];
			file.data[i][4] = query[4];
		}
	}
	
	fs.writeFile(fitnessDatasourcePath, prettyStringify(file), function (err) {
	  if (err) return console.log(err);
	});

	res.sendStatus(200);
})

app.post('/createLabels', function (req, res) {
	var ret = "";
	var keys = getJsonFields(req.body.data);
	keys.forEach(function(key)
	{
		var parents = key.parents.join('.');
		var parents2 = key.parents.join('');
		ret += `${parents}.${key.key} = res.${parents2}${key.key};`;
		ret +="\n";
	});
	
	var template = '[ResourceEntry("{key}", Value = "{value}", Description = "{key}", LastModified = "2018/06/06")] \r\n public string {key} => this["{key}"];';

	keys.forEach(function(key)
	{
		ret += template.replace(new RegExp("{key}", 'g'), key.parents.join('') + key.key).replace(new RegExp("{value}", 'g'), key.value);
		ret += "\n";
		ret += "\n";
	});

	res.status(200).send(ret);
})

function getJsonFields(data, parents) {
	if(!parents)
		parents = [];
	
	var ret = [];
	
	if(!data)
		return ret;
	
	if(data.constructor !== {}.constructor)
		data = JSON.parse(data);
			
	Object.keys(data).forEach(function(key) {
		var isObject = typeof(data[key]) == "object";
		if(isObject)
		{
			var innerParents = parents.slice();
			innerParents.push(key.charAt(0).toUpperCase() + key.slice(1));
			
			var inner = getJsonFields(data[key], innerParents);
			if(inner)
			{
				inner.forEach(function(innerKey) { ret.push(innerKey);});
			}
		}
		else
		{
			ret.push({"key": key, "parents": parents, "value": data[key] });
		}
	});
	return ret;
}

setInterval(function() {
    http.get("http://aubah.herokuapp.com");
}, 300000); // every 5 minutes (300000)

var port = process.env.PORT || 1337;
app.listen(port);

console.log("Server running at http://localhost:%d", port); 