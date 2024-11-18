// actions/productActions.js
import axios from 'axios';
import { PRODUCT_DELETE_FAIL, PRODUCT_DELETE_REQUEST, PRODUCT_DELETE_SUCCESS } from '../constants/productConstants';
import { BACKEND_DEV_API } from '../API';

// Action to delete a product
export const deleteProduct = (productId) => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_DELETE_REQUEST });
    const deletedProduct =  await axios.delete(`${BACKEND_DEV_API}/api/products/delete/${productId}`);
    dispatch({
      type: PRODUCT_DELETE_SUCCESS,
      payload: productId,
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_DELETE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};
