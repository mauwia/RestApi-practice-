const express=require('express')
const {body}=require('express-validator')
const User=require('../models/user')
const authControoler=require('../controller/auth')

const router = express.Router()

router.put('/signup',[
    body('email').isEmail().withMessage('Invalid Email')
    .custom((value,{req})=>{
        return User.findOne({email:value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('Email already exist')
            }
        })
    }).normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
],authControoler.signUp)

router.post('/login',authControoler.login)

module.exports=router