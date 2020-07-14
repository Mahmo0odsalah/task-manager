import mongoose from "mongoose";

mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      return console.log("Couldn't connect to Database");
    }
    console.log("Successfully connected to Database");
  }
);
