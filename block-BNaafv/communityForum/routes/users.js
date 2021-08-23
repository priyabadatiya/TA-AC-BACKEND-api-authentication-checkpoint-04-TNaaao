var express = require('express');
var router = express.Router();
let User = require('../models/users');
let auth = require('../middlewares/auth');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//register user
router.post('/register', async (req, res, next) => {
  req.body.user.isBlocked = false;
  req.body.user.role = "user";
  try{
      let user = await User.create(req.body.user);
      let token = await user.signToken();
      return res.status(200).json({user: user.userLoginJSON(token)});
  }catch(error){
      next(error);
  }
});

//login user
router.post('/login', async (req, res, next) => {
  let {email, passwd} = req.body.user;
  if(!email || !passwd){
    return res.status(400).json({errors: {body: ["Email/Password required"]}});
  }
  try{
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({errors: {body: ["Email is not registered"]}});
    }
    if(user.isBlocked){
      return res.status(201).json({msg: "Your account is blocked by the Admin"});
    }
    let result = await user.verifyPasswd(passwd);
    if(!result) {
      return res.status(400).json({errors: {body: ["Password is incorrect"]}});
    }
    let token = await user.signToken();
    return res.status(200).json({user: user.userLoginJSON(token)});
  }catch(error) {
    next(error);
  }
});


//get current user
router.get('/current-user', auth.verifyToken, async(req, res, next) => {
  try{
      let user = await User.findById(req.user.userId);
      return res.status(200).json({user: user.userLoginJSON(req.headers.authorization)});
  }catch(error) {
    next(error);
  }
});

//follow user

router.get('/follow/:userId', auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  try {
    let loggedUser = await User.findOne({ username: loggedprofile.username });
    console.log(loggedUser.following.includes(userId));
    if (userId === loggedUser.id) {
      return res.status(400).json({ error: 'you cannot follow yourself' });
    } else if (loggedUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ error: 'you can not follow same person twice' });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(userId, {
        $push: { followers: loggedUser.id },
      });

      let updatedUser = await User.findByIdAndUpdate(loggedUser.id, {
        $push: { following: userId },
      });

      return res.json({ updatedUser, updatedTargetUser });
    }
  } catch (error) {
    next(error);
  }
});

//unfollow user

router.get('/unfollow/:userId', auth.isLoggedIn, async (req, res, next) => {
  let userId = req.params.userId;
  let loggedprofile = req.user;
  try {
    let loggedUser = await User.findOne({ username: loggedprofile.username });

    if (userId === loggedUser.id) {
      return res.status(400).json({ error: 'you cannot unfollow yourself' });
    } else if (!loggedUser.following.includes(userId)) {
      return res.status(400).json({ error: 'you can not follow same person twice' });
    } else {
      let updatedTargetUser = await User.findByIdAndUpdate(userId, {
        $pull: { followers: loggedUser.id },
      });

      let updatedUser = await User.findByIdAndUpdate(loggedUser.id, {
        $pull: { following: userId },
      });

      return res.json({ updatedUser, updatedTargetUser });
    }
  } catch (error) {
    next(error);
  }
});

//block user by admin

router.get('/block/:username', auth.authOptional, async (req, res, next) => {
  let username = req.params.username;

  try {
    let updateduser = await User.findOneAndUpdate(
      { username },
      { isBlocked: true }
    );

    let updatedProfile = await Profile.findOneAndUpdate(
      { username },
      { isBlocked: true }
    );

    return res.json({ updatedProfile });
  } catch (error) {
    next(error);
  }
});

//unblock user by admin

router.get('/unblock/:username', auth.authOptional, async (req, res, next) => {
  let username = req.params.username;

  try {
    let updateduser = await User.findOneAndUpdate(
      { username },
      { isBlocked: false }
    );

    let updatedProfile = await Profile.findOneAndUpdate(
      { username },
      { isBlocked: false }
    );

    return res.json({ updatedProfile });
  } catch (error) {
    next(error);
  }
});



module.exports = router;