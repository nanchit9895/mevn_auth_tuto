const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secret;
const User = require('../../model/User');


/**
 * @route POST api/users/register
 * @desc Register the User
 * @access Public
 */
router.post('/register', (req,res) =>{
    let{
        name,
        username,
        email,
        password,
        confirm_password
    } = req.body 
    if(password != confirm_password){
        return res.status(400).json({
            msg: "Password do not match."
        });       
    }


    // Check for Unique Username
    User.findOne({
        username: username
    }).then(user =>{
        if(user) {
            return res.status(400).json({
                msg: "Username is already taken."
            });
        }
    });

    // Check for Unique Email
    User.findOne({
        email: email
    }).then(user =>{
        if (user) {
            return res.status(400).json({
                msg: "Email is already registered. Did you forgot your password?"
            });
        }
    });

    // Data valid and new user can register
    let newUser = new User({
        name,
        username,
        password,  
        confirm_password,      
        email
    });

    // Hash Password    
    bcrypt.genSalt(10, (err,salt) => {
        bcrypt.hash(newUser.password, salt, (err,hash) =>{
            if(err) throw err;
            newUser.password= hash;
            newUser.save().then(user =>{
                return res.status(201).json({
                    success: true,
                    msg: "User is now registered."
                });
            });
        });
    });    

}); 


router.post('/login', (req,res) =>{
    User.findOne({
        username: req.body.username
    }).then(user=>{
        if(!user){
            return res.status(404).json({
                msg: "Login Fail, username not found!",
                success: false
            });
        }

        // If user exists , Checking Password
        bcrypt.compare(req.body.password, user.password ).then(isMatch =>{
            if (isMatch) {
                const payload =  {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email
                }
                jwt.sign(payload, key, {
                    expiresIn: 604800
                }, (err,token) =>{
                    res.status(200).json({
                        success: true,
                        token: `Bear ${token}`,
                        msg: "You are now logged in."
                    });
                });
            } else {
                return res.status(404).json({
                    msg: "Incorrect password.",
                    success: "false"
                });
            }
        });
    });
});


router.get('/profile', passport.authenticate('jwt', {
    session: false
}),(req,res) =>{

});

module.exports = router;