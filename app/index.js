// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const uuidv4 = require('uuid/v4');
const favicon = require('serve-favicon');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const datasourcePath = __dirname + '/data/location_history.json';

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (request, response) => {
  response.render('home')
})

app.get('/pomodoro', (request, response) => {
  response.render('pomodoro')
})

app.use("/js", express.static(__dirname + '/js'));
app.use("/data", express.static(__dirname + '/data'));

app.use(favicon(path.join(__dirname, '/images', 'favicon.ico')));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/poi', function (req, res) {
	var query = req.body;
	var file = require(datasourcePath);
	var newLoc = {
		"id" : uuidv4(),
		"name" : query.name,
		"lat" : query.lat,
		"lng" : query.lng,
		"link" : query.link
	};
	file.locations.push(newLoc);
	fs.writeFile(datasourcePath, JSON.stringify(file), function (err) {
	  if (err) return console.log(err);
	});
	res.sendStatus(200);
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
	fs.writeFile(datasourcePath, JSON.stringify(file), function (err) {
	  if (err) return console.log(err);
	});
	res.sendStatus(200);
})
app.listen(80)
