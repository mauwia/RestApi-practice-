const {validationResult}=require('express-validator')
const Post=require('../models/posts')
const User=require('../models/user')
const path=require('path')
const fs=require('fs')

exports.getPosts=(req,res,next)=>{
    Post.find().then(posts=>{
        res.status(200).json({
            message:'Fetched post',posts:posts
        })
    }).catch(err=>{
        if(!err.statusCode){
            err.statusCode=500
        }
        next(err)
    })
    
}

exports.createPost=(req,res,next)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        const error=new Error('Validation Failed')
        error.statusCode=422
        throw error
    }
    if(!req.file){
        const error=new Error('No image provided')
        error.statusCode=422
        throw error
    }
    // var creater
    const post=new Post({
        title:req.body.title,
        content:req.body.content,
        imageUrl:req.file.path,
        creator:req.userId
    })
    post.save()
    .then(result=>{
        return User.findById(req.userId)
    }).then(user=>{
        
        user.posts.push(post)
       return user.save()
    }).then(result=>{
        
        res.status(201).json({
            message:'POST CREATED SUCCESSFULLY',
            post:post,
            creator:result
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500
        }
        next(err)
    })
    
}

exports.getPost=(req,res,next)=>{
    const postId=req.params.postId
    Post.findById(postId).then(post=>{
        if(!post){
            const error=new Error('Not Found')
            error.statusCode=404
            throw error 
        }
        res.status(200).json({message:'Post fetched',post:post})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500
        }
        next(err)
    })
}

exports.updatePost=(req,res,next)=>{
    const postId=req.params.postId
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        const error=new Error('Validation Failed')
        error.statusCode=422
        throw error
    }
    
    let imageUrl=req.body.imageUrl
    if(req.file)
    imageUrl=req.file.path
    if(!imageUrl){
        const error=new Error('No file picked')
        error.statusCode=422
        throw error
    }
    Post.findById(postId).then(post=>{
        if(!post){
            const error=new Error('Not Found')
            error.statusCode=404
            throw error 
        }
        if(post.creator.toString()!==req.userId){
            const err= new Error("NOT AUTHORIZED")
            err.statusCode=403
            throw err
        }
        if(imageUrl!==post.imageUrl){
            clearImage(post.imageUrl)
        }
        post.title=req.body.title
        post.imageUrl=imageUrl
        post.content=req.body.content
        return post.save()
    }).then(result=>{
        res.status(200).json({message:'Post Updated',post:result})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500
        }
        next(err)
    })
    
}
exports.deletePost=(req,res,next)=>{
    const postId=req.params.postId
    Post.findById(postId).then(post=>{
        if(!post){
            const error=new Error('Not Found')
            error.statusCode=404
            throw error 
        }
        if(post.creator.toString()!==req.userId){
            const err= new Error("NOT AUTHORIZED")
            err.statusCode=403
            throw err
        }if(post.creator.toString()!==req.userId){
            const err= new Error("NOT AUTHORIZED")
            err.statusCode=403
            throw err
        }
        clearImage(post.imageUrl)
        return Post.findByIdAndRemove(postId)
    }).then(resu=>{
  
        return User.findById(req.userId)
    }).then(user=>{
        
        user.posts.pull(postId)
        return user.save()
    })
    .then(result=>{
        res.status(200).json({message:'Post Deleted'})
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode=500
        }
        next(err)
    })
    
}

const clearImage=filePath=>{
    filePath=path.join(__dirname,'..',filePath)
    fs.unlink(filePath,err=>console.log(err))
}