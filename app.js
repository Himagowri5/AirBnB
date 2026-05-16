const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("connected to Db");
    }
)
.catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/",(req,res)=>{
    res.send("hi i am root");
});


//Index Route
app.engine('ejs', ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.get("/listings",wrapAsync (async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings})
}));

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMSg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMSg);
    }else{
        next();
    }
};

app.use(express.static(path.join(__dirname,"/public")));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
    
});

//show Route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    res.render("listings/show.ejs",{listing});
}));

//create new rout to connect the new form
app.post("/listings",validateListing, wrapAsync (async (req, res,next) => {
    let result=listingSchema.validate(req.body);
    console.log(result);
    if(result.error){
        throw new ExpressError(400,result.err);
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")

}));

//edit route
app.get("/listings/:id/edit",wrapAsync (async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//upadte route
app.put("/listings/:id",validateListing, wrapAsync (async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete
app.delete("/listings/:id",wrapAsync (async(req,res)=>{
    let{id}=req.params;
    let deletedListing =await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new listing({
//         title:"My Home",
//         description:"By the beach",
//         price:12000,
//         location:"goa",
//         country:"india",
//     });
//     await sampleListing.save();
//     console.log("sample was saved ");
//     res.send("sucessful testing");

// });

app.use((req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});

app.use((err, req,res , next)=>{
    let{statusCode=500,message="somthing went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    //res.status(statusCode).send(message);
});
app.listen(8080, () =>{
    console.log("server is running in 8080");
});