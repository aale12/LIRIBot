require('dotenv').config();
const request = require('request');
const inquirer = require('inquirer');
const moment = require('moment');
const fs = require('fs');
const Spotify = require('node-spotify-api');
const keys = require('./keys.js');

const spotify = new Spotify(keys.spotify);

function spotifySearch(song) {
  spotify.search({ type: 'track', query: song }, (err, data) => {
    if (err) {
      return console.log(`Error occurred: ${err}`);
    }
    fs.writeFile('spotify.txt', JSON.stringify(data, null, 2), (error) => {
      if (error) console.log(error);
    });
    console.log(`Artist(s): ${data.tracks.items[0].artists[0].name}`);
    console.log(`Song Name: ${data.tracks.items[0].name}`);
    console.log(`Spotify link: ${data.tracks.items[0].external_urls.spotify}`);
    return console.log(`Album: ${data.tracks.items[0].album.name}`);
  });
}
function OMDbSearch(input) {
  request(`http://www.omdbapi.com/?t=${input}&apikey=trilogy`, (err, res, body) => {
    if (err || JSON.parse(body).Response === 'False') {
      console.log('Not a movie');
    } else {
      console.log(`Title: ${JSON.parse(body).Title}.`);
      console.log(`Year of Release: ${JSON.parse(body).year}.`);
      console.log(`IMDb Rating: ${JSON.parse(body).imdbRating}.`);
      console.log(`Rotten Tomatoes Rating: ${JSON.parse(body).Ratings[1].Value}.`);
      console.log(`Production Country: ${JSON.parse(body).Country}.`);
      console.log(`Synopsis: ${JSON.parse(body).Plot}.`);
      console.log(`Actors: ${JSON.parse(body).Actors}.`);
    }
  });
}
function venueSearch(input) {
  request(`https://rest.bandsintown.com/artists/${input}/events?app_id=codingbootcamp`, (err, res, body) => {
    if (err || body === '{warn=Not found}\n') {
      console.log('Did you mispell that artist?');
    }
    if (JSON.parse(body).length === 0) {
      console.log('No upcoming venues for that artist.');
    } else {
      console.log(`Upcoming events for ${input}.`);
      console.log(`Name: ${JSON.parse(body)[0].venue.name}.`);
      console.log(`Location: ${JSON.parse(body)[0].venue.city}, ${JSON.parse(body)[0].venue.country}.`);
      console.log(`Date: ${moment(JSON.parse(body)[0].datetime).format('MMMM Do YYYY, h:mm:ss a')}.`);
    }
  });
}

const menu = {
  endMenu: function () {
    return inquirer.prompt([
      {
        message: 'u done?',
        name: 'endMenu',
        type: 'confirm',
      },
    ]);
  },
  startMenu: function () {
    inquirer.prompt([
      {
        type: 'list',
        name: 'userSelection',
        message: 'wat u wanna do?',
        choices: [{
          name: 'Spotify',
          value: 'spotifySearch',
        },
        {
          name: 'OMDb',
          value: 'OMDbSearch',
        },
        {
          name: 'Bands in Town',
          value: 'venueSearch',
        }],
      }
    ]).then((choice) => {
      switch (choice.userSelection) {
        case 'spotifySearch':
          inquirer.prompt([
            {
              type: 'input',
              name: 'userInput',
              message: 'wat song?',
            },
          ]).then((input) => {
            spotifySearch(input.userInput);
          });
          break;
        case 'venueSearch':
          inquirer.prompt([
            {
              type: 'input',
              name: 'userInput',
              message: 'wat band?',
            },
          ]).then((input) => {
            venueSearch(input.userInput);
          });
          break;
        case 'OMDbSearch':
          inquirer.prompt([
            {
              type: 'input',
              name: 'userInput',
              message: 'wat movie?',
            },
          ]).then((input) => {
            OMDbSearch(input.userInput);
          });
          break;
        default:
          this.endMenu();
      }
    })
  },
}
if (process.argv[2] === undefined) {
  menu.startMenu();
} else if (process.argv[2] === 'do-what-it-says') {
  let command = '';
  let thing = '';
  fs.readFile('random.txt', 'utf8', (err, res) => {
    if (err) return console.log(err)
    const txtArray = res.split(',');
    command = txtArray[0];
    thing = txtArray[1];
    switch (command) {
      case 'spotify-this-song':
        spotifySearch(thing);
        break;
      case 'movie-this':
        OMDbSearch(thing);
        break;
      case 'concert-this':
        venueSearch(thing);
    }
  });
}

