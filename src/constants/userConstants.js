export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";

export const REGISTER_USER_REQUEST = "REGISTER_USER_REQUEST";
export const REGISTER_USER_SUCCESS = "REGISTER_USER_SUCCESS";
export const REGISTER_USER_FAIL = "REGISTER_USER_FAIL";

export const LOAD_USER_REQUEST = "LOAD_USER_REQUEST";
export const LOAD_USER_SUCCESS = "LOAD_USER_SUCCESS";
export const LOAD_USER_FAIL = "LOAD_USER_FAIL";

export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGOUT_FAIL = "LOGOUT_FAIL";
export const ADD_CONFETTI = "ADD_CONFETTI";
export const REMOVE_CONFETTI = "REMOVE_CONFETTI";
export const UPDATE_PROFILE_REQUEST = "UPDATE_PROFILE_REQUEST";
export const UPDATE_PROFILE_SUCCESS = "UPDATE_PROFILE_SUCCESS";
export const UPDATE_PROFILE_RESET = "UPDATE_PROFILE_RESET";
export const UPDATE_PROFILE_FAIL = "UPDATE_PROFILE_FAIL";

export const UPDATE_PASSWORD_REQUEST = "UPDATE_PASSWORD_REQUEST";
export const UPDATE_PASSWORD_SUCCESS = "UPDATE_PASSWORD_SUCCESS";
export const UPDATE_PASSWORD_RESET = "UPDATE_PASSWORD_RESET";
export const UPDATE_PASSWORD_FAIL = "UPDATE_PASSWORD_FAIL";

export const FORGOT_PASSWORD_REQUEST = "FORGOT_PASSWORD_REQUEST";
export const FORGOT_PASSWORD_SUCCESS = "FORGOT_PASSWORD_SUCCESS";
export const FORGOT_PASSWORD_FAIL = "FORGOT_PASSWORD_FAIL";

export const RESET_PASSWORD_REQUEST = "RESET_PASSWORD_REQUEST";
export const RESET_PASSWORD_SUCCESS = "RESET_PASSWORD_SUCCESS";
export const RESET_PASSWORD_FAIL = "RESET_PASSWORD_FAIL";

export const ALL_USERS_REQUEST = "ALL_USERS_REQUEST";
export const ALL_USERS_SUCCESS = "ALL_USERS_SUCCESS";
export const ALL_USERS_FAIL = "ALL_USERS_FAIL";

export const USER_DETAILS_REQUEST = "USER_DETAILS_REQUEST";
export const USER_DETAILS_SUCCESS = "USER_DETAILS_SUCCESS";
export const USER_DETAILS_FAIL = "USER_DETAILS_FAIL";

export const UPDATE_USER_REQUEST = "UPDATE_USER_REQUEST";
export const UPDATE_USER_SUCCESS = "UPDATE_USER_SUCCESS";
export const UPDATE_USER_RESET = "UPDATE_USER_RESET";
export const UPDATE_USER_FAIL = "UPDATE_USER_FAIL";

export const DELETE_USER_REQUEST = "DELETE_USER_REQUEST";
export const DELETE_USER_SUCCESS = "DELETE_USER_SUCCESS";
export const DELETE_USER_FAIL = "DELETE_USER_FAIL";
export const DELETE_USER_RESET = "DELETE_USER_RESET";

export const CLEAR_ERRORS = "CLEAR_ERRORS";

function geturl() {
  const current = process.env.REACT_APP_API;
  if (current == "local") {
    return "http://54.172.255.164";
    //return "http://dream-env.eba-6d6ds7up.us-east-1.elasticbeanstalk.com";
    //return "https://backendforpuand-dream11.onrender.com";
    //return 'http://localhost:8000';
  }
  else {
    //return "https://backendforpuand-dream11.onrender.com";
    return "https://thepowerplay11-env.eba-ev2x8aa4.ap-south-1.elasticbeanstalk.com";
    //return "http://35.78.205.163";
    //return "http://dream-env.eba-6d6ds7up.us-east-1.elasticbeanstalk.com";
    //return "http://54.172.255.164";
  }
}

function getfrontendurl() {
  const current = process.env.REACT_APP_API;
  if (current == "local") {
    return "http://localhost:3000";
  }
  return "https://dream-11-clone-mern-stack.vercel.app";
}

export const URL = geturl();
export const FURL = getfrontendurl();
