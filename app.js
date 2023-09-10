//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const multer = require("multer"); 
const _ =require("lodash");

const app = express();
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); 
app.use(cookieParser(null, { sameSite: "None", secure: true }));


app.use(session({//to acess session package always up mongoose***
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "None",
    secure: true
}
}));
mongoose.connect("mongodb+srv://swapansuvo648:ronisuvo@cluster0.kardea6.mongodb.net/travelDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
.then(function(){
  console.log("success");
})
.catch(function(err){
  console.log(err);
})

const placesSchema = {
    name: String
  };
const Place = mongoose.model("Place", placesSchema);

const hotelsSchema = {
    name: String
  };
const Hotel = mongoose.model("Hotel", hotelsSchema);

const hoteldetailsSchema = {
  section: String,
  name: String,
  location: String,
  ownerName: String,
  price: Number,
  guest: Number,
  bed: Number,
  bathroom: Number,
  description: String,
  gogleMap: String,
  imageName: String,
  imageBinary: Buffer,
  hoteltype: String
};
const Details = mongoose.model("Details", hoteldetailsSchema);


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });





app.get("/",function(req,res){
  res.render("home");
});


app.get("/search", async (req, res) => {
  const customPlaceName = _.capitalize(req.query.placeName);

  try {
      const foundPlace = await Details.findOne({ section: customPlaceName });
      if (foundPlace) {
          res.redirect(`/${customPlaceName}`);
      } else {
          res.redirect("/")
      }
  } catch (error) {
      console.error(error);
      res.send("An error occurred.");
  }
});



app.get("/input",function(req,res){
  res.render("input");
});





app.get("/payment",function(req,res){
  res.render("payment");
});


async function getCount(filter, customPlaceName) {
  let detailsQuery = { section: customPlaceName };
  if (filter === 'House') {
    detailsQuery.hoteltype = 'House';
  }
  else if(filter === 'Hostel'){
    detailsQuery.hoteltype = 'Hostel';
  }
  else if(filter === 'Flat'){
    detailsQuery.hoteltype = 'Flat';
  }
  else if(filter === 'Villa'){
    detailsQuery.hoteltype = 'Villa';
  }
  else if(filter === 'Guest-Suite'){
    detailsQuery.hoteltype = 'Guest-Suite';
  }
  else if (filter === '50') {
    detailsQuery.price = { $lte: 50 };
  }
  else if (filter === '60') {
    detailsQuery.price = { $lte: 60 };
  }
  else if (filter === '70') {
    detailsQuery.price = { $lte: 70 };
  }
  else if (filter === '80') {
    detailsQuery.price = { $lte: 80 };
  }
  else if (filter === '90') {
    detailsQuery.price = { $lte: 90 };
  }
  else if (filter === '100') {
    detailsQuery.price = { $lte: 100 };
  }
  else if (filter === '10000') {
    detailsQuery.price = { $lte: 10000 };
  }
  const count = await Details.countDocuments(detailsQuery);
  return count;
}

app.get("/:customPlaceName", async (req, res) => {
  const customPlaceName = _.capitalize(req.params.customPlaceName);
  console.log("Custom Place Name:", customPlaceName);
  try {
    const foundPlace = await Place.findOne({ name: customPlaceName });
    if (!foundPlace) {
      
      return res.redirect("/");
    }

    let detailsQuery = { section: customPlaceName };

    if (req.query.priceRange && req.query.House) {
      const maxPrice = parseFloat(req.query.priceRange);
      const houseType = req.query.House;

      
      detailsQuery = {
        section: customPlaceName,
        price: { $lte: maxPrice },
        hoteltype: houseType
      };
    } else if (req.query.priceRange) {
      const maxPrice = parseFloat(req.query.priceRange);

      
      detailsQuery = {
        section: customPlaceName,
        price: { $lte: maxPrice }
      };
    } else if (req.query.House) {
      const houseType = req.query.House;

      
      detailsQuery = {
        section: customPlaceName,
        hoteltype: houseType
      };
    }

    
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const perPage = 4;
    const startIndex = (currentPage - 1) * perPage;

    const detailsCount = await Details.countDocuments(detailsQuery);
    const totalPages = Math.ceil(detailsCount / perPage);

    const details = await Details.find(detailsQuery)
      .skip(startIndex)
      .limit(perPage);
    const houseCount = await getCount('House', customPlaceName);
    const hostelCount = await getCount('Hostel', customPlaceName);
    const flatCount = await getCount('Flat', customPlaceName);
    const villaCount = await getCount('Villa', customPlaceName);
    const price50Count = await getCount('50', customPlaceName);
    const price60Count = await getCount('60', customPlaceName);
    const price70Count = await getCount('70', customPlaceName);
    const price80Count = await getCount('80', customPlaceName);
    const price90Count = await getCount('90', customPlaceName);
    const price100Count = await getCount('100', customPlaceName);
    const price10000Count = await getCount('10000', customPlaceName);
    const guestSuiteCount = await getCount('Guest-Suite', customPlaceName);

    res.render("listing", {
      placeTitle: foundPlace.name,
      details: details,
      currentPage: currentPage,
      totalPages: totalPages,
      houseCount: houseCount,
      hostelCount: hostelCount,
      flatCount: flatCount,
      villaCount: villaCount,
      guestSuiteCount : guestSuiteCount,
      price50Count: price50Count,
      price60Count: price60Count,
      price70Count: price70Count,
      price80Count: price80Count,
      price90Count: price90Count,
      price100Count: price100Count,
      price10000Count: price10000Count 
    });
  } catch (error) {
    console.error(error);
    res.send("An error occurred.");
  }
});



app.get("/:customPlaceName/:hotelName", async (req, res) => {
  try {
    const customPlaceName = _.capitalize(req.params.customPlaceName);
    const hotelName = req.params.hotelName; 

    const foundPlace = await Place.findOne({ name: customPlaceName });
    if (!foundPlace) {
      return res.redirect("/");
    }


    const details = await Details.findOne({
      section: customPlaceName,
      name: { $regex: new RegExp('^' + hotelName + '$', 'i') }
    });

    if (!details) {
      return res.send("Hotel details not found");
    }

    const foundHotel = await Hotel.findOne({ name: details.name });

    if (!foundHotel) {
      const hotel = new Hotel({
        name: details.name
      });
      await hotel.save();
      return res.redirect(`/${customPlaceName}/${hotelName}`);
    }

    res.render("house", { details: details, hotelTitle: foundHotel.name });
  } catch (error) {
    console.error(error);
    res.send("An error occurred.");
  }
});



app.post("/input", upload.single("image"), async (req, res) => {
  try {
      const newHotelDetail = new Details({
          section: req.body["Section-Name"],
          name: req.body["HotelTitle"],
          location: req.body["Hotel-location"],
          ownerName: req.body["Hotelowner"],
          price: parseFloat(req.body["HotelPrice"]),
          guest: parseInt(req.body["guest"]),
          bed: parseInt(req.body["bed"]),
          bathroom: parseInt(req.body["bathroom"]),
          description: req.body["description"],
          gogleMap: req.body["gogle-i-frame"],
          imageName: req.file.originalname,
          imageBinary: req.file.buffer,
          hoteltype:req.body["Hoteltype"]
      });
      await newHotelDetail.save();
      res.status(200).send("Data uploaded and saved to MongoDB.");
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
  }
});











app.listen(3000, function () {
    console.log("Server started on port 3000");
  });