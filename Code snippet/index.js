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

var count =0;
let countries = "";
 // fetching data from visited countries 
 let result = await db.query("select country_code from visited_countries");
 let data = result.rows;
 let array  = [];
 data.forEach(element => {
     array.push(element.country_code);
     count++;
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
  let postresult = await db.query("select country_code from countries WHERE country_name LIKE $1||'%'",[country]);
  let postdata = postresult.rows;

  postdata.forEach(element => {
      array.push(element.country_code);
  });

  console.log(array[array.length-1]);
  try {
    let insertresult = await db.query("insert into visited_countries(country_code) VALUES ($1)",[array[array.length-1]]);
    console.log(insertresult.rows);  
    count= array.length;

  } catch (error) {
    console.log("HEY its an error");
    array.pop();
  }
  // reddirecting to app.get with the same data
  res.redirect("/");
})


var total;

// to show the visited countries to the user 
app.get("/", async (req, res) => {
  res.render('index.ejs',{
    countries: array,
    total: count
  })
});

// when u enter websites u see all those countries that you have vistited
// then u can put the countries which u want to visit and change their color 
// then put that data into visited_countries.

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
//////
