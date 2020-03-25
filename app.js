const express=require('express')
const path=require('path')
const bodyParser=require('body-parser')
const feedRoutes=require('./routes/feed')
const authRoutes=require('./routes/auth')

const mongoose=require('mongoose')
const cors=require('cors');
const multer=require('multer')
const app= express()
mongoose.set('useFindAndModify', false);
const fileStorage=multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
});

const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/png'||file.mimetype==='image/jpg'||file.mimetype==='image/jpeg'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }
}


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(
    multer({storage:fileStorage,fileFilter:fileFilter}).single('image')
    )
app.use('/images',express.static(path.join(__dirname,'images')))
app.use('/feed',feedRoutes)
app.use('/auth',authRoutes)
app.use((err,req,res,next)=>{
    console.log(err)
    const status=err.statusCode || 500
    const message=err.message
    res.status(status).json({message:message})
})
mongoose.connect('mongodb+srv://mauwia:muawiyah17@cluster0-uqdch.mongodb.net/messages?retryWrites=true&w=majority',{ useUnifiedTopology: true,useNewUrlParser: true })
.then(res=>app.listen(8080))
.catch(err=>console.log(err))