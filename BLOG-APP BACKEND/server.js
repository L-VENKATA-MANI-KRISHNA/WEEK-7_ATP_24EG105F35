import exp from 'express'
import { connect } from 'mongoose'
import { commonApp } from './APIs/commonAPI.js'
import { userApp } from './APIs/userAPI.js'
import { authorApp } from './APIs/authorAPI.js'
import { adminApp } from './APIs/adminAPI.js'
import { config } from 'dotenv'
import cookieParser from "cookie-parser";
config()
const app=exp()
//body parser middleware
app.use(exp.json());
app.use(cookieParser());
//path level middleware
app.use("/user-api", userApp)
app.use("/author-api", authorApp);
app.use("/admin-api", adminApp);
app.use("/common-api", commonApp)

//connect to database
const connectDB=async()=>{
try{
await connect(process.env.DB_URL);
console.log("DB server connected");
//assign port
const port =process.env.PORT || 5000
app.listen(port,()=>console.log(`server listening on ${port}...`))

}catch(err){
console.log("err in db connection",err)
}
}
connectDB();


//To handle invalid Path
app.use((req, res, next) => {
  res.status(404).json({ message: `Path ${req.url} is Invalid` })
})

//To handle errors
app.use((err, req, res, next) => {
  console.log(err.name)
  console.log(err.stack);
  //validation Error
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error Occurred", error: err.message })
  }
  //Cast Error
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error Occurred", error: err.message })
  }
  //Duplicate Key Error (e.g. unique email)
  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(400).json({ message: "error Occurred", error: "Duplicate value entered. This email/username may already be registered." })
  }
  //Custom Error
  //send Server side Error
  return res.status(500).json({ message: "error Occurred", error: "Server side error" })
});

