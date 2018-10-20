require('dotenv').config();
const request = require('request');
const inquirer = require('inquirer');
const moment = require('moment');
const Spotify = require('node-spotify-api');
const keys = require('./keys.js');

const spotify = new Spotify(keys.spotify);
function spotifySearch(song) {
  spotify.search({ type: 'track', query: song }, (err, data) => {
    if (err) {
      return console.log(`Error occurred: ${err}`);
    }
    console.log(data.tracks.items[0].artists[0].name);
    return console.log(JSON.stringify(data, null, 2));
  });
}
function main() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'userInput',
      message: 'What song would you like to lookup?',
    },
  ]).then((input) => {
    if (input.userInput === '') {
      console.log('No song entered!');
      spotifySearch('Ace of Base');
    } else {
      spotifySearch(input.userInput);
    }
  });
}
main();
