const express=require("express");
const router=express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");


const multer  = require('multer')
const {storage}=require("../cloudConfig.js");
const upload = multer({storage})

router.route("/")
.get(wrapAsync (listingController.index))
.post(isLoggedIn,
    validateListing, 
    upload.single('listing[image]'),wrapAsync (listingController.createListing));

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);
//search bar
router.get("/search", listingController.search);
router.route("/:id")
.get(wrapAsync(listingController.showListings))

.put(isLoggedIn,isOwner,validateListing,upload.single("listing[image]"), wrapAsync (listingController.updateListing))
.delete(isLoggedIn,wrapAsync (listingController.deleteListing));

//edit
router.get("/:id/edit",isLoggedIn,wrapAsync (listingController.editListing));

//filters
router.get("/filter/:category", listingController.filter);
module.exports=router;

