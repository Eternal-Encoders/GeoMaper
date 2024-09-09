import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GeoPoint } from "../../utils/interface";

const initialState: GeoPoint[] = [];

const pointsSlice = createSlice({
    name: "points",
    initialState,
    reducers: {
        pointPush: (state, action: PayloadAction<GeoPoint>) => {
            const x = action.payload.x;
            const y = action.payload.y;
            const latitude = action.payload.latitude;
            const longitude = action.payload.longitude;

            state.push({
                x,
                y,
                latitude,
                longitude
            });
        },
        pointsPop: (state) => {
            state.pop();
        }
    },
    selectors: {
        selectAllPoints: state => state,
        selectLastPoint: state => state[state.length - 1]
    }
})

export const {
    pointPush,
    pointsPop
} = pointsSlice.actions;

export const {
    selectAllPoints,
    selectLastPoint
} = pointsSlice.selectors;

export default pointsSlice.reducer;