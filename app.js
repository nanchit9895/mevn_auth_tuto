const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');


const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));    

app.use(bodyParser.json());

app.use(cors());

app.use(express.static(path.join(__dirname,'public')));

app.use(passport.initialize());

const db = require('./config/keys').mongoURI;
mongoose.connect(db, 
    {useUnifiedTopology: true, useNewUrlParser:true}
).then(() =>{
    console.log(`Database connect successfully ${db}`)
}).catch(err =>{
    console.log(`Unable to connect to database ${err}`)
});

// app.get('/', (req,res) =>{
//     return res.send("<h1>Hello, This is Home!</h1>");
// });

// Bring in the user route
const users = require('./routes/api/users');
app.use('/api/users', users);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});