const { Router } = require("express")
const { userModel } = require("../db/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_USER_PASSWORD } = require("../config");

const userRouter = Router();

userRouter.post("/signuo", async (req,res)=>{
    const {email,password,firstName,lastName} = req.body;

    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        await userModel.create({
            email:email,
            password:hashedPassword,
            firstName:firstName,
            lastName:lastName
        })

        res.status(200).json({
            message:"signup succeeded"
        })
    }catch(err){
        res.status(500).json(err);
    }
});

userRouter.post("/signin", async(req,res)=>{
    const {email,password} = req.body;

    try{
        const user = await userModel.findOne({
            email:email
        })
        if(!user){
            res.status(404).json("user not found")
        }

        const validPassword = await bcrypt.compare(password,user.password);
        if(!validPassword){
            res.status(404).json("password is incorrect")
        }

        if(user){
            const token = jwt.sign({
                id:user._id
            },JWT_USER_PASSWORD)
    
            res.json({
                token : token
            })
        }else{
            res.status(403).json({
                message:"Incorrect credentials"
            })
        }

    }catch(err){
        res.status(500).json(err);
    }
})