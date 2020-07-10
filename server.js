const express = require('express')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const { imageHandler } = require('./cropperStandAlone')

const apiPort = process.env.PORT || 5000;
const app = express()

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());


app.post('/crop', function (req, res) {

  console.log(req.body.user.id)
  console.log(req.body.user.docid)
  console.log(req.body.user.email)
  imageHandler(req.body.user.id, req.body.user.docid, req.body.user.email)
    .catch(err => {
      console.error(err);
    })
  res.send('pong');
})

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))
