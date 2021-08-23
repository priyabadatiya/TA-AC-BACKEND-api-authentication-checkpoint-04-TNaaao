let jwt = require('jsonwebtoken');

module.exports = {
  verifyToken: async function (req, res, next) {
    console.log("no")
    try {
      let token = req.headers.authorization;
      if (!token) {
        return res.status(400).json({ error: 'User must be logged in' });
      } else {
        let profileData = await jwt.verify(token, process.env.SECRET);
        req.user = profileData;
        next();
      }
    } catch (error) {
      console.log(error)
      next(error);
    }
  },
  authOptional: async (req, res, next) => {
    let token = req.headers.authorization;
    try{
        if(token) {
            let payload = await jwt.verify(token, process.env.SECRET);
            req.user = payload;
            return next();
        }else {
            return next();
            
        }
    }catch(error) {
        next(error);
    }
},
};