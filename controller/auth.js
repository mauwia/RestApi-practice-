const User=require('../models/user')
const bycrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {validationResult}=require('express-validator')
exports.signUp=(req,res,next)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        const error=new Error('Validation failed')
        error.statusCode=422
        throw error
    }
    bycrypt.hash(req.body.password,12)
    .then(hashedPw=>{
        const user=new User({
            email:req.body.email,
            password:hashedPw,
            name:req.body.name
        })
        return user.save()
    }).then(result=>{
        res.status(201).json({message:'User Created',userId:result})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500
        }
        next(err)
    })
    
}
exports.login=(req,res,next)=>{
    let loadedUser
    User.findOne({email:req.body.email})
    .then(user=>{
        if(!user){
            const error=new Error("USER NOT FOUND")
            error.statusCode=401
            throw error
        }
        loadedUser=user
        bycrypt.compare(req.body.password,user.password).then(isEqual=>{
            if(!isEqual){
                const err=new Error('WRONG PASSWORD')
                err.statusCode=401
                throw err
            }
            const token=jwt.sign({
                email:loadedUser.email,
                userId:loadedUser._id.toString()
            },'secret1',{expiresIn:'1hr'})
            res.status(200).json({token:token,userId:loadedUser._id.toString()})
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500
        }
        next(err)
    })
}