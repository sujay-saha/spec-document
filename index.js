let express = require("express");
let { track } = require("./model/track.model");
let { user } = require("./model/user.model");
let { like } = require("./model/like.model");
let { sequelize } = require("./lib/index");

const { parse } = require("querystring");

let cors = require("cors");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { userInfo } = require("os");
// let sqlite3 = require('sqlite3').verbose();
// let { open } = require('sqlite');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
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
    name: "Raabta",
    genre: "Romantic",
    release_year: 2012,
    artist: "Arijit Singh",
    album: "Agent Vinod",
    duration: 4,
  },
  {
    name: "Naina Da kya Kasoor",
    genre: "Pop",
    release_year: 2018,
    artist: "Amit Trivedi",
    album: "Andhadhun",
    duration: 3,
  },
  {
    name: "Ghoomar",
    genre: "Traditional",
    release_year: 2018,
    artist: "Shreya Ghoshal",
    album: "Padmaavat",
    duration: 3,
  },
];

app.get("/seed_db", async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    await track.bulkCreate(movieData);

    await user.create({
      username: "testuser",
      email: "testuser@gmail.com",
      password: "testuser",
    });

    res.status(200).json({ message: "Database seeding successful!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error seeding the data", error: error.message });
  }
});

/*-------------------------5.2-------------------------------- */

async function fetchAllTracks() {
  let tracks = await track.findAll();
  return { tracks };
}

app.get("/tracks", async (req, res) => {
  try {
    let response = await fetchAllTracks();
    console.log(response);
    if (response.tracks.length === 0) {
      return res.status(404).json({ message: "No tracks found!" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//findOne({where:{id}}),findAll(where:{artist}),findAll{order:[["release_year",order]]}#asc/desc

/*-------------------------5.3-------------------------------- */

async function addNewTrack(newTrack) {
  let track1 = await track.create(newTrack);
  return track1;
}
app.post("/tracks/new", async (req, res) => {
  try {
    let newTrack = req.body.newTrack;
    let response = await addNewTrack(newTrack);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function updateTrack(id, updateTrackVal) {
  let updateResponse = await track.findOne({ where: { id } });
  if (!updateResponse) {
    return {};
  }
  updateResponse.set(updateTrackVal);
  let updatedTrack = await updateResponse.save();
  return { message: "Track updated successfully", updatedTrack };
}

app.post("/tracks/update/:id", async (req, res) => {
  try {
    let id = parseInt(req.params.id);
    let updateTrackVal = req.body;
    let response = await updateTrack(id, updateTrackVal);
    if (!response.message) {
      return res
        .status(404)
        .json({ message: "Track for updation, Not Found!" });
    }
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function deleteTrackById(id) {
  let trackDestroyed = await track.destroy({ where: { id } });
  if (trackDestroyed === 0) {
    return {};
  }
  return { message: "Track record deleted" };
}

app.post("/tracks/delete", async (req, res) => {
  try {
    let id = parseInt(req.body.id);
    let response = await deleteTrackById(id);
    if (!response.message) {
      res.status(404).json({ message: "Track Not Found for Deletion!" });
    }
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/*-------------------------5.4-------------------------------- */
async function addNewUser(newUser) {
  let newData = await user.create(newUser);
  return newData;
}

app.post("/users/new", async (req, res) => {
  try {
    let newUser = req.body.newUser;
    let response = await addNewUser(newUser);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function updateUserById(id, updateUser) {
  let updatedResponse = await user.update(updateUser, { where: { id } });
  return updatedResponse;
}

app.post("/users/update/:id", async (req, res) => {
  try {
    let id = parseInt(req.params.id);
    let updateUser = req.body;
    let response = await updateUserById(id, updateUser);
    if (!response || response[0] === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchAllUsers() {
  let users = await user.findAll();
  return { users };
}

app.get("/users", async (req, res) => {
  try {
    let response = await fetchAllUsers();
    console.log(response);
    if (response.users.length === 0) {
      return res.status(404).json({ message: "No tracks found!" });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function likeTrack(data) {
  let newLike = await like.create({
    userId: data.userId,
    trackId: data.trackId,
  });
  return { message: "Track Liked!", newLike };
}

app.get("/users/:id/like", async (req, res) => {
  try {
    let userId = req.params.id;
    let trackId = req.query.trackId;
    let response = await likeTrack(userId, trackId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
