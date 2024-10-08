const router = require('express').Router();
const passport = require('passport');

router.get('/login/success',(req,res)=>{
    if (req.user){
        res.status(200).json({
            error:false,
            message:"Successfully Loged in",
            user:req.user,
        });
    } else {
        res.status(403).json({error:true,message:"Not Authorized"});
    }
});

router.get("/login/failed",(req,res)=>{
    res.status(401).json({
        error:true,
        message:"Log in failure",
    });
});

router.get('/google',passport.authenticate('google',{ scope:
    [ 'email', 'profile' ] 

}));

router.get(
    "/google/callback",
    (req,res,next)=>{
        console.log('77777777777');
        next();
    },
    passport.authenticate("google",{
        successRedirect:process.env.client_URL,
        failureRedirect: "/login/failed",
    })
);
     
router.get("/logout",(req,res)=>{
    req.logout();
    res.redirect(process.env.client_URL);
});

module.exports = router;     

     