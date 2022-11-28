import { UnAuthenticatedError, UnAuthorizedError } from "../errors/index.js";
import { isTokenValid } from "../utils/index.js";

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new UnAuthenticatedError("Unauthorized!");
  }
  try {
    const { userId, name, role } = isTokenValid({ token });
    req.user = { userId, name, role };
    next();
  } catch (error) {
    console.log("error inside authentication.js: ", error);
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnAuthorizedError("Unauthorized to access this route");
    }
    next();
  };
};

export { authenticateUser, authorizePermissions };
