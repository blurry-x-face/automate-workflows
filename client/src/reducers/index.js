const Reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuth: action.payload.isAuth,
        isLoading: false,
      };
    case "REGISTER":
      return {
        ...state,
        isAuth: action.payload.isAuth,
        isLoading: false,
      };
    case "VERIFY_AUTH":
      return {
        ...state,
        isAuth: true,
        isLoading: false,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default Reducer;
