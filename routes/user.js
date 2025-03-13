const { Router } = require("express")
const { userModel } = require("../db/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");

const userRouter = Router();

userRouter.post("/signup", async (req,res)=>{


    try{
        const {userName,email,password,firstName,lastName} = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        await userModel.create({
            userName: userName,
            email:email,
            password:hashedPassword,
            firstName:firstName,
            lastName:lastName
        })

        // const newUser = await new userModel({
        //     userName: userName,
        //     email:email,
        //     password:hashedPassword,
        //     firstName:firstName,
        //     lastName:lastName
        // });

        // await newUser.save();

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
});

userRouter.put("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json({ error: "Error hashing password", details: err.message });
            }
        }
        try {
            const user = await userModel.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            }, { new: true });

            res.status(200).json({ message: "Account updated successfully", user });
        } catch (err) {
            return res.status(500).json({ error: "Error updating user", details: err.message });
        }
    } else {
        return res.status(403).json({ error: "You can update only your account" });
    }
});

userRouter.delete("/:id", async (req, res) => {
    if (req.body.userId == req.params.id || req.body.isAdmin) {
        try {
            await userModel.findByIdAndDelete(req.params.id);

            res.status(200).json({ message: "Account deleted successfully"});
        } catch (err) {
            return res.status(500).json({ error: "Error updating user", details: err.message });
        }
    } else {
        return res.status(403).json({ error: "You can delete only your account" });
    }
});

userRouter.get("/:id",async(req,res)=>{
    try{
        const user = await userModel.findById(req.params.id);
        const{password,updatedAt, ...other} = user._doc
        res.status(200).json(other)
    }catch(err){
        res.status(500).json(err)
    }
})

userRouter.put("/:id/follow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await userModel.findById(req.params.id);
            const currentUser = await userModel.findById(req.body.userId);

            if (!user || !currentUser) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { following: req.params.id } });

                res.status(200).json({ message: "User has been followed" });
            } else {
                res.status(403).json({ message: "You already follow this user" });
            }
        } catch (err) {
            res.status(500).json({ message: "Internal server error", error: err.message });
        }
    } else {
        res.status(403).json({ message: "You can't follow yourself" });
    }
});

userRouter.put("/:id/unfollow", async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await userModel.findById(req.params.id);
            const currentUser = await userModel.findById(req.body.userId);

            if (!user || !currentUser) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { following: req.params.id } });

                res.status(200).json({ message: "User has been unfollowed" });
            } else {
                res.status(403).json({ message: "You dont follow this user" });
            }
        } catch (err) {
            res.status(500).json({ message: "Internal server error", error: err.message });
        }
    } else {
        res.status(403).json({ message: "You can't unfollow yourself" });
    }
});

module.exports = {
    userRouter:userRouter
}