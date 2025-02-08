import Jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    console.log("hhh");
    const token = req.cookies["chattu-token"];
    console.log(token);
    if (!token)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = Jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedData._id;

    next();
  } catch (error) {
    next(error)
  }
};
export {isAuthenticated}
