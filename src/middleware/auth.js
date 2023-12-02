import jwt from "jsonwebtoken";
import userModel from "../../DB/model/user.model.js";
export const roles = {
  Admin: "Admin",
  User: "User",
};
export const auth = (accessRoles = []) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARERKEY)) {
      return res.status(400).json({ message: "Invalid autherization" });
    }
    const token = authorization.split(process.env.BEARERKEY)[1];
    const decoded = jwt.verify(token, process.env.LOGINSECRET);
    if (!decoded) {
      return res.status(400).json({ message: "Invalid autherization" });
    }
    const user = await userModel.findById(decoded.id).select("userName role");
    if (!user) {
      return res.status(404).json({ message: "not registerd user" });
    }
    if (parseInt(user.changePassword?.getTime() / 1000) > decoded.iat) {
      // check if the time of changing password is after of creating the token or sign in time,so sign out the token is expired
      return next(new Error(`expired token , plz login`, { cause: 400 }));
    }
    if (!accessRoles.includes(user.role)) {
      return res.status(403).json({ message: "not auth user" });
    }
    req.user = user;
    next();
  };
};
