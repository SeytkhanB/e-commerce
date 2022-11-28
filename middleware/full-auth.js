import { UnAuthenticatedError } from "../errors/index.js";
import { isTokenValid } from "../utils/jwt.js";

const authenticateUser = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new UnAuthenticatedError("Authentication invalid");
  }

  try {
    const payload = isTokenValid(token);
    // attach the user and his permissions to the req object
    req.user = {
      userId: payload.user.userId,
      role: payload.user.role,
    };
    next();
  } catch (error) {
    throw new UnAuthenticatedError("Authentication invalid");
  }
};

const authorizateRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnAuthenticatedError("Unauthorized to access this route");
    }

    next();
  };
};

export { authenticateUser, authorizateRoles };
