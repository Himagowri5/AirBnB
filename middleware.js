const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
   // console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
       req.flash("error","you must be logged in to create llisting");
       return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","you donot have permission to do this")
        return res.redirect(`/listings/${id}`);
    }
    next();
};

//validate listing
module.exports.validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMSg=error.details.map((el)=>el.message).join(",");
        console.log(req.body);
        throw new ExpressError(400,errMSg);
    }else{
        next();
    }

};

//validate reviews
module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    console.log("BODY =", req.body);
console.log("FILE =", req.file);
    if(error){
        let errMSg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMSg);
    }else{
        next();
    }
};


module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you donot have permission to do this")
        return res.redirect(`/listings/${id}`);
    }
    next();
};