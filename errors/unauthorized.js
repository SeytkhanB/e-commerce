import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./custom-api.js";

class UnAuthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export default UnAuthorizedError;
