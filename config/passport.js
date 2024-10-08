import passport from 'passport';
import passportJWT from 'passport-jwt';
import User from '../validate/userValidation.js';
import dotenv from 'dotenv';

dotenv.config();

const ExtractJWT = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const secret = process.env.JWT_SECRET;

const params = {
  secretOrKey: secret,
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
};

const configurePassport = () => {
  passport.use(
    new Strategy(params, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (user) {
          console.log('User found:', user);
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    })
  );

};

export default configurePassport;