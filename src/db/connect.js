import mongoose from "mongoose";

const connect = async () => {
  try {
    console.log("Attempting to connect to database...");
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("Connected to the database...");
  } catch (error) {
    console.error("Failed to connect database...", error.message);
    process.exit(1);
  }
}

export default connect;
// This code connects to a MongoDB database using Mongoose. It attempts to connect to the database using the URI 
// stored in the environment variable MONGO_URI. If the connection is successful, it logs a success message; if it fails, 
// it logs an error message and exits the process with a failure code.