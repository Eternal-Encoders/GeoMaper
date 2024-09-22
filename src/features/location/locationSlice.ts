import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GpsPoint } from "../../utils/interface";

const locationSlice = createSlice({
    name: "location",
    initialState: {
        latitude: 56.84453670213695,
        longitude: 60.653147993721525,
        altitude: 20.21312312312
    },
    reducers: {
        locationSet: (state, action: PayloadAction<GpsPoint>) => {
            const latitude = action.payload.latitude;
            const longitude = action.payload.longitude;
            const altitude = action.payload.altitude;

            state.latitude = latitude;
            state.longitude = longitude;
            state.altitude = altitude;
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