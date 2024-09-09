import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const locationSlice = createSlice({
    name: "location",
    initialState: {
        latitude: 56.84453670213695,
        longitude: 60.653147993721525
    },
    reducers: {
        locationSet: (state, action: PayloadAction<{latitude: number, longitude: number}>) => {
            const latitude = action.payload.latitude;
            const longitude = action.payload.longitude;

            state.latitude = latitude;
            state.longitude = longitude;
        }
    },
    selectors: {
        selectLocation: state => state
    }
})

export const {
    locationSet
} = locationSlice.actions;

export const {
    selectLocation
} = locationSlice.selectors;

export default locationSlice.reducer;