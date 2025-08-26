import { Middleware } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { cartApi } from "../../api/cartApi";
import { addItem, clearCart, decreaseQuantity, increaseQuantity, removeItem, updateItem } from "../slices/cartSlice";
const createSyncCartWithServer = () => {
  return debounce(async (store) => {
    const items = JSON.parse(JSON.stringify(store.getState().cart.items));
    const menuType = store.getState().user.menuType;

    await store.dispatch(
      cartApi.endpoints.addToCart.initiate({
        items,
        menu_type: menuType
      })
    );
    // await POST({
    //   endpoint: `/cart?branch=ashrafieh`,
    //   formData: { items, order_type: orderType }
    // });
    // console.log('Cart synced with server');

  }, 800);
};


const cartMiddleware: Middleware = store => next => async action => {
  const syncCartWithServer = createSyncCartWithServer();

  const result = next(action);

  if (
    addItem.match(action) ||
    updateItem.match(action) ||
    clearCart.match(action) ||
    increaseQuantity.match(action) ||
    decreaseQuantity.match(action) ||
    removeItem.match(action)
  ) {
    syncCartWithServer(store);
  }

  return result;

};

export default cartMiddleware;

