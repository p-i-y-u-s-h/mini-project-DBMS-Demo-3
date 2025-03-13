const { Router } = require("express")
const  userModel  = require("../db/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");

const userRouter = Router();

userRouter.post("/signup", async (req,res)=>{
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
        const newuser = new userModel({
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });

        const user = await newuser.save();
        res.status(200).json(user)

    }catch (err){
        res.status(500).json(err);
    }
});

module.exports = {
    userRouter:userRouter
}