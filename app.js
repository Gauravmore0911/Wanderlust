const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require('./model/Listing');
const path =require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require('./Utils/wrapAsync.js');
const ExpressError = require('./Utils/ExpressError.js');
const { render } = require("ejs");




const MONGO_URL="mongodb://127.0.0.1:27017/Wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch (err =>{
    console.log(err);

});


async function main(){
    await mongoose.connect(MONGO_URL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


app.get("/",(req,res)=>{
    res.send("hi,i am root");
});
//index Router
app.get("/listing",wrapAsync(async(req,res)=> {
    const allListings=await Listing.find({});
    console.log(allListings)
    res.render("listings/index.ejs",{allListings});
    })); 

       //new Route
      
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
  });

    //show Route
    app.get("/listings/:id",wrapAsync( async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/show.ejs", { listing });
      }));

      //Create Route
app.post("/listings", 
  wrapAsync(async (req, res ,next) => {
    if(req.body.listing){
      
      throw new ExpressError(400,"send valid data for listing");
    };
   const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
  

 })
);
    

  //Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }));
  
  //Update Route
  app.put("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
  app.delete("/listings/:id",wrapAsync( async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listing");
  }));



   

//app.get("/testlisting",async(req,res) => {

  //  let SampleListing = new Listing({
    //title:"My New Villa",
  //  description : "By the beach",
  //  price: 1200,
  //  location:"Calaungat,Goa",
  //  country:"India",

//});
 //  await SampleListing.save();
   // console.log("Sample was saved");
    //res.send("Successful testing");

//});
app.all("*",(req,res,next)=>{
next(new ExpressError(404,"Page not found!"))
})

//app.use((err,req,res,next)=>{
  //let{statusCode=500,message="Somthing went Wrong!"}=err;
  //res.render("error.ejs" ,{ message });
  // res.status(statusCode).send(message);
//});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080,() =>{
    console.log("server is listning to port 8080");
});