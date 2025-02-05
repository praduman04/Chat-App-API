import mongoose from "mongoose";
export const connectDB=async () => {
    try {
        if (!process.env.CONNECTION_STRING) {
            throw new Error("MongoDB connection string is not defined in the environment variables.");
          }
      const connect = await mongoose.connect(process.env.CONNECTION_STRING,{dbName:"Chat App"});
      console.log(
        "Database connected: ",
        connect.connection.host,
        connect.connection.name
      );
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  };