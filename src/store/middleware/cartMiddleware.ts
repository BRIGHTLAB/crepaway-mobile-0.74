import { Middleware } from "@reduxjs/toolkit";
import { debounce } from "lodash";
import { cartApi } from "../../api/cartApi";
import { addItem, clearCart, decreaseQuantity, increaseQuantity, removeItem, updateItem, setCartSyncing, setCartFromFetch } from "../slices/cartSlice";

// TODO Re add types
let lastSuccessfulItems: any | null = null;

const syncCartWithServer = debounce(async (store) => {
  try {
    const items = JSON.parse(JSON.stringify(store.getState().cart.items));
    const menuType = store.getState().user.menuType;

    await store.dispatch(
      cartApi.endpoints.addToCart.initiate({
        items,
        menu_type: menuType
      })
    ).unwrap();
    lastSuccessfulItems = items;
  } catch (error) {
    console.error('Error syncing cart:', error);
    if (lastSuccessfulItems) {
      store.dispatch(setCartFromFetch({ items: lastSuccessfulItems }));
    } else {
      store.dispatch(setCartFromFetch({ items: {} }));
    }
  } finally {
 
    store.dispatch(setCartSyncing(false));
  }
}, 500);

const cartMiddleware: Middleware = store => next => async action => {
  const shouldSync = (
    addItem.match(action) ||
    updateItem.match(action) ||
    clearCart.match(action) ||
    increaseQuantity.match(action) ||
    decreaseQuantity.match(action) ||
    removeItem.match(action)
  );

  const result = next(action);

  if (shouldSync) {
    store.dispatch(setCartSyncing(true));
    syncCartWithServer(store);
  }

  return result;

};

export default cartMiddleware;

