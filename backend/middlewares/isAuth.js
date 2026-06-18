import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    // token either from cookies or headers
    let token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Please login again" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = verifyToken.userId;
    req.role = verifyToken.role || null;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid or expired session" });
  }
};

export default isAuth;
