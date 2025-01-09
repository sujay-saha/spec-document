let express = require('express');
let { track } = require('./model/track.model');
let { sequelize } = require('./lib/index');

// const { resolve } = require('path');

let cors = require('cors');
// let sqlite3 = require('sqlite3').verbose();
// let { open } = require('sqlite');

const app = express();
const port = 3000;

app.use(cors());
// app.use(express.json());

// let db;
// (async () => {
//   db = await open({
//     filename: '../database.sqlite',
//     driver: sqlite3.Database,
//   });
// })();

/*-------------------------5.1-------------------------------- */
let movieData = [
  {
    name: 'Raabta',
    genre: 'Romantic',
    release_year: 2012,
    artist: 'Arijit Singh',
    album: 'Agent Vinod',
    duration: 4,
  },
  {
    name: 'Naina Da kya Kasoor',
    genre: 'Pop',
    release_year: 2018,
    artist: 'Amit Trivedi',
    album: 'Andhadhun',
    duration: 3,
  },
  {
    name: 'Ghoomar',
    genre: 'Traditional',
    release_year: 2018,
    artist: 'Shreya Ghoshal',
    album: 'Padmaavat',
    duration: 3,
  },
];

app.get('/seed_db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    await track.bulkCreate(movieData);

    res.status(200).json({ message: 'Database seedng successful!' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error seeding the data', error: error.message });
  }
});

/*-------------------------5.2-------------------------------- */

async function fetchAllTracks() {
  let tracks = await track.findAll();
  return { tracks };
}

app.get('/tracks', async (req, res) => {
  try {
    let response = await fetchAllTracks();
    console.log(response);
    if (response.tracks.length === 0) {
      return res.status(404).json({ message: 'No tracks found!' });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//findOne({where:{id}}),findAll(where:{artist}),findAll{order:[["release_year",order]]}#asc/desc

/*-------------------------5.3-------------------------------- */

async function addNewTrack(newTrack) {
  let track = await track.create(newTrack);
  return track;
}
app.post('/tracks/new', async (req, res) => {
  try {
    let newTrack = req.body.newTrack;
    let response = await addNewTrack(newTrack);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
