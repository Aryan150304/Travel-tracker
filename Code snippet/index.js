import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "1234fzr@",
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let countries = "";
 // fetching data from visited countries 
 let result = await db.query("select country_code from visited_countries");
 let data = result.rows;
 let array  = [];
 data.forEach(element => {
     array.push(element.country_code);
 });

// function to capitialise initial characters of the countries
function capital(name){
  name = name.charAt(0).toUpperCase()+name.slice(1);
  return name;
}

// countries that user can manually add will add in the same array of visited countries
app.post("/add",async (req,res)=>{
  var country = req.body.country;
  country = capital(country);
  console.log(country);
  let postresult = await db.query("select country_code from countries WHERE country_name = $1",[country]);
  let postdata = postresult.rows;

  postdata.forEach(element => {
      array.push(element.country_code);
  });
  try {
    let insertresult = await db.query("insert into visited_countries(country_code) VALUES ($1)",[array[array.length-1]]);
    console.log(insertresult.rows);  
  } catch (error) {
    console.log("HEY its an error");
  }

  // reddirecting to app.get with the same data
  res.redirect("/");
})


var total;

// to show the visited countries to the user 
app.get("/", async (req, res) => {
  res.render('index.ejs',{
    countries: array,
    total: array.length
  })
});

// when u enter websites u see all those countries that you have vistited
// then u can put the countries which u want to visit and change their color 
// then put that data into visited_countries.

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
//////