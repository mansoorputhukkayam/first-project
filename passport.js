const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

passport.use(
    new GoogleStrategy(
        {
            clientID:process.env.Google_client_id,
            clientSecret:process.env.Google_client_secret,
            callbackURL:"http://localhost:3000/auth/google/callback",
            scope: ["profile","email"],
        },
        function (accessToken, refreshToken, profile, callback){
            console.log('profile Data')
            console.log(profile)
            callback(null,profile);
        }
    )
);

passport.serializeUser((user, done)=>{
    done(null,user);
});

passport.deserializeUser((user, done)=>{
    done(null, user);
});

module.exports = passport;