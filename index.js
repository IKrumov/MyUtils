// index.js
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const uuidv4 = require('uuid/v4');
const favicon = require('serve-favicon');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');
const datasourcePath = __dirname + '/app/data/location_history.json';

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'app/views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'app/views'))

app.get('/', (request, response) => {
  response.render('home')
})

app.get('/pomodoro', (request, response) => {
  response.render('pomodoro')
})

app.get('/copytools', (request, response) => {
  response.render('copytools')
})

app.use("/app", express.static(__dirname + '/app'));
app.use("/app/js", express.static(__dirname + '/app/js'));
app.use("/app/data", express.static(__dirname + '/app/data'));

app.use(favicon(path.join(__dirname, '/app/images', 'favicon.ico')));

app.use(bodyParser.urlencoded({
    extended: true
}));

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
	fs.writeFile(datasourcePath, JSON.stringify(file), function (err) {
	  if (err) return console.log(err);
	});
	res.send(200, { id: id });
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

var port = process.env.PORT || 1337;
app.listen(port);

console.log("Server running at http://localhost:%d", port); 
