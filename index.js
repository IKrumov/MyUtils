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

setInterval(function() {
    http.get("http://www.ikrumov.com");
}, 300000); // every 5 minutes (300000)

var port = process.env.PORT || 1377;
app.listen(port);

console.log("Server running at http://localhost:%d", port); 
