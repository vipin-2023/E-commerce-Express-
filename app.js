var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var hbs = require("express-handlebars");

var app = express();
var fileUpload = require("express-fileupload");
var db = require("./config/connection");
var session = require("express-session");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    helpers: {
      inc: function (value, options) {
        return parseInt(value) + 1;
      },
    },
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
//middle wares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());
app.use(session({ secret: "Key", cookie: { maxAge: 3200000000000000 } ,   resave :false,
saveUninitialized: true,}));
db.connect((err) => {
  if (err) {
    console.log("Db Connection Error");
  } else {
    console.log("Db Connection Success");
  }
});

app.use("/", userRouter);
app.use("/admin", adminRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
