import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "******",
  port: 5432,
});
var currentname;

var currentMember  = 0;

db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var total;

let countries = "";
var color;

// whenever user confirms to delete in delete.ejs 
app.post("/yes",async(req,res)=>{
    try {
        var query = await db.query("Delete from user_details WHERE user_id = $1",[currentMember]);
        console.log(query.rows);
        currentMember= 0;
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
})

// whenver user clicks on delete route it leads to delete .ejs
app.post("/delete",(req,res)=>{
    res.render('delete.ejs');
})

app.post("/newmem",(req,res)=>{
    res.render('newmember.ejs');
})
// function to capitialise initial characters of the countries
function capital(name){
  name = name.charAt(0).toUpperCase()+name.slice(1);
  return name;
}

app.post('/member',async(req,res)=>{
    var names = req.body.memberArray;
    console.log(req);
    try {
        let name = await db.query("Select * from user_details WHERE user_name = $1",[names]);
        currentMember = name.rows[0].user_id;
        currentname = names;
        color = name.rows[0].color;
        console.log(currentMember);
        console.log(currentname);
        res.redirect("/");

    } catch (error) {
        console.log(error);
    }
    
})
app.post('/addnewmember',async(req,res)=>{
    let name = req.body.name;
    let colorvalue = req.body.color;
    console.log(name,colorvalue);
    // case if the user enter number name instead of char name so to handle the error
    try {
        // how to consider multiple users
        let insertresult = await db.query("insert into user_details(user_name, color) VALUES ($1,$2)",[name,colorvalue]);



        // we have to decide current member and current name here
        currentname = name;
        let val = await db.query("Select user_id from user_details WHERE user_name = $1",[name]);
        currentMember = val.rows[0].user_id;
        color =  colorvalue;
        // so whatever the count member is that member will be showed on opening
        res.redirect("/"); 
      } catch (error) {
        console.log("OOPS, There is an error. Pls try again");
      }
})
// countries that user can manually add will add in the same array of visited countries

app.post("/add",async(req,res)=>{
    var country = req.body.country;
    country= capital(country);
    try {
        let addcountry = await db.query("Select id from countries WHERE country_name LIKE $1||'%'",[country]);
        let countryId = addcountry.rows[0].id;
        console.log(countryId);

        // now inserting the same in 
        try {
            let insertCountry = await db.query("Insert into usercountry VALUES ($1,$2)",[currentMember ,countryId]);
        console.log(insertCountry.rows);  
        } catch (error) {
            console.log(error);
        }
        
    } catch (error) {
        console.log("Sorry the country does not exist");
    }
    res.redirect("/");
})

app.get("/", async (req, res) => {
    var count =0;
    var members;
    let array  = [];
    let userCheck = await db.query("select * from user_details");
    let userdetails = userCheck.rows;
    if (userdetails.length == 0) {
         res.render('newmember.ejs');
    } 
    else{
        // now i have to get the data combining user id and country id 
        const sqlQuery = "select user_details.user_id,user_details.user_name,user_details.color,usercountry.country_id,countries.country_code,countries.country_name from user_details  JOIN usercountry ON user_details.user_id = usercountry.user_id JOIN countries ON usercountry.country_id = countries.id WHERE user_details.user_id = $1";
        // fetching all the data of a particular user id that makes u more closes to idea of the project
        let completeDetails = [];
       
        if(userdetails.length ==1||currentMember==0){
            currentMember  =userdetails[0].user_id;
            currentname =userdetails[0].user_name;
            color = userdetails[0].color;
        }
        completeDetails = await db.query(sqlQuery,[currentMember]);
         
        
        
        // now u have combined the data of the user and country so u have everything so need to perform searching as u have country code and country id
        for(const element of completeDetails.rows){
            array.push(element.country_code);
            count++;
        }
        res.render('index.ejs',{
            total: count,
            countries: array,
            members: userCheck.rows,
            color: color,
            currentname: currentname
        })
    }

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
