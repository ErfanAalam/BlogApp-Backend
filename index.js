import express from 'express'
import cors from 'cors'
import mongoose, { Schema, model } from 'mongoose'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3003

app.use(cors({ origin: "http://localhost:5173" }))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

mongoose.connect("mongodb://127.0.0.1:27017/firstDB").then(() => {
    console.log("database connected");
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    })
})

const infoSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    }

})

const infoModel = new model("information", infoSchema, "info")


app.get("/", async (req, res) => {
    res.header("content-type", "application/json")
    const users = await infoModel.find()
    res.json(users)
})

app.get("/edit/:idToEdit", async (req, res) => {
    const dataToUpdate = await infoModel.findById(req.params.idToEdit)
    res.json(dataToUpdate)
})


app.post("/getdata", async (req, res) => {
    console.log(req.body);
    const dataToSave = new infoModel(req.body)
    await dataToSave.save()
    res.json("submited Data")
})

app.delete("/delete", async (req, res) => {
    const deleteUser = await infoModel.findByIdAndDelete(req.body.id)
    if (deleteUser._id === req.body.id) res.json(req.body.id);
    // console.log(req.body.id);

})



app.put("/updateData", async (req, res) => {
    const { name, email, message, id } = req.body
    const updateData = await infoModel.findByIdAndUpdate(id, {
        name,
        email,
        message
    });
    if (updateData._id) res.json("Data Updated")
})


const blogSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    file: {
        type: String,
    },
})

const blogModel = model("blogs", blogSchema)

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join( 'uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/showblog", async (req, res) => {
    res.header("content-type", "Application/json")
    const blogs = await blogModel.find()
    res.json(blogs)
})

app.post("/addBlog", upload.single('file'), async (req, res) => {

    const { author, title, desc } = req.body
    const file = req.file.path

    const blogToSave = new blogModel({
        author,
        title,
        desc,
        file
    })
    
    await blogToSave.save()
    console.log(req.body)
    console.log(req.file)
    res.json("blog saved")
})

app.get("/search", async (req, res) => {
    const searchBlog = req.query.q
    const foundedBlog = await blogModel.find({
        $or: [
            { title: searchBlog },
            { author: searchBlog }
        ]
    })
    res.json(foundedBlog)
})


