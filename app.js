var express= require("express");
var mongoose = require("mongoose");
var expressSanitizer= require("express-sanitizer");
var methodOverride = require("method-override");
var request = require('request');
var bodyParser  = require("body-parser");
var app = express();



//mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true});

var url = process.env.DATABASEURL || "mongodb+srv://alex:test@restblog-6pq9k.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(url, {useNewUrlParser: true});


// mongodb+srv://alex:test@restblog-6pq9k.mongodb.net/test?retryWrites=true&w=majority




app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());


// Mongoose / Model Config
//create schema

var blogSchema =new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});


var Blog = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES




//homepage
app.get("/", function(req, res){
    res.redirect("blogs");
})
//1  INDEX

app.get("/blogs", function(req, res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log("ERROR!");
        }else{
            res.render("index", {blogs: blogs});
        }
    });
});

//2. NEW ROUTE. NEW.EJS   has the form that goes to /blogs
//and the method="POST"
app.get("/blogs/new", function(req,res){
    res.render("new");
})

// 3. CREATE ROUTE  add sanitize

app.post("/blogs", function(req,res){
    //sanitize:   .blog.body  because its called blog.body(the text area)
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    // req.body.blogs works because we used name for inputs like
    //name="blog[body]" for body title and image
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            //then, redirect to index
            res.redirect("/blogs");
        }
    })
});

//4. SHOW ROUTE
//ok, so here we get the id in the index page with <%= blog._id %>
//both blog.id and blog._id return the same thing, difference is
//that ._id is object and .id is String, both return the id so its ok
//we could also get body.title; body.image to redirect to blogs/(inside of title)

app.get("/blogs/:id", function(req,res){
    //Blog.findById(id,callbackFunction)
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/index");
        }else{
            //create show template and pass the blog there to render it
            res.render("show",{blog:foundBlog});
        }
    })
});

//5.EDIT ROUTE
//edit file prefilled with data and also get the id
//so that it edits the right post
//we get the prefilled data with 'value='
app.get("/blogs/:id/edit",function(req,res){
    //get the id
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            //render edit and also send the id(actually all data)
            res.render("edit",{blog:foundBlog});
         }
    });

});


//6. UPDATE ROUTE    have to use _method   +sanitize
 
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    //Blog.findByIdAndUpdate(id, newData, callback)
    //newData is however we named it as an object in edit, here is blog
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }

    });
    
});

//7. DESTROY ROUTE have to use _method


app.delete("/blogs/:id", function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            //redirect
            res.redirect("/blogs");
        }
    });
});


request("https://jsonplaceholder.typicode.com/users", function(error, response, body){
    if(!error && response.statusCode ==200){
        var parsedData = JSON.parse(body);
       // console.log(parsedData[id="0"]);
    }
});

// my request route


app.get("/results", function(req, res){
    var query = req.query.search;

    var url = "http://www.omdbapi.com/?s="+query+"&apikey=thewdb";
    request(url, function(error,response, body){
        if(!error && response.statusCode==200){
            var data = JSON.parse(body);
           // res.render("results", {data:data});
           console.log(data);
        }
    })
});


app.listen(process.env.PORT || 3000, function(req, res){
    console.log("Server is running");
})