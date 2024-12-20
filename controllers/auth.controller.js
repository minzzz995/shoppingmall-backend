const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const authController = {}
require("dotenv").config();
const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY
const {GoogleAuth, OAuth2Client} = require('google-auth-library');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID

authController.loginWithEmail = async (req, res) => {
    try {
        const {email, password} = req.body
        let user = await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch){
                const token = await user.generateToken()
                return res.status(200).json({status:"success", user, token})
            }
        }
        throw new Error("invalid email or password")
    } catch(error){
        res.status(400).json({status:"fail", error: error.message})
    }
}

authController.loginWithGoogle = async (req, res) => {
    try {
        const { token } = req.body
        const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
        const ticket = await googleClient.verifyIdToken({
            idToken:token,
            audience:GOOGLE_CLIENT_ID
        })

        const { email, name } = ticket.getPayload()

        let user = await User.findOne({ email })
        if(!user){
            const randomPassword = ""+Math.floor(Math.random()*100000000)
            const salt = await bcrypt.genSalt(10)
            const newPassword = await bcrypt.hash(randomPassword, salt)
            user = new User({
                name,
                email,
                password: newPassword
            })
            await user.save()
        }
        const sessionToken = await user.generateToken()
        res.status(200).json({status:"success", user, token: sessionToken})
    } catch(error){
        return res.status(400).json({status:"fail", error: error.message})
    }
}

authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization
        if(!tokenString) throw new Error("Token not found")
        const token = tokenString.replace("Bearer ", "")
        jwt.verify(token, JWT_SECRET_KEY, (error, payload)=>{
            if(error) throw new Error("invalid token")
                req.userId = payload._id
        })
        next()
    } catch(error){
        res.status(400).json({status:"fail", error: error.message})
    }
}

// authController.checkAdminPermission = async (req, res, next) => {
//     try {
//         const {userId} = req
//         const user = await User.findById(userId)
//         if(user.level !== "admin") throw new Error("no permission")
//         next();
//     } catch(error){
//         res.status(400).json({status:"fail", error: error.message})
//     }
// }

authController.checkAdminPermission = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId); // userId로 유저 정보 조회

        if (!user) throw new Error("User not found");
        if (user.level !== "admin") throw new Error("No permission");

        req.user = user; // req.user에 유저 정보 저장
        next();
    } catch (error) {
        res.status(403).json({ status: "fail", error: error.message });
    }
};

module.exports=authController