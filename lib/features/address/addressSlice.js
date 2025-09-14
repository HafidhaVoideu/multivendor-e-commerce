import { createSlice } from "@reduxjs/toolkit";
import { addressDummyData } from "./../../../assets/assets";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    list: [addressDummyData],
  },
  reducers: {
    addAddress: (state, action) => {
      state.list.push(action.payload);
    },
  },
});

export const { addAddress } = addressSlice.actions;

export default addressSlice.reducer;
