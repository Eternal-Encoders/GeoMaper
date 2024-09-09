import { useEffect } from "react";
import { locationSet, selectLocation } from "../../features/location/locationSlice";
import { useAppDispatch, useAppSelector } from "../../store/hook";

function useOverlay() {
    const dispatch = useAppDispatch();
    const coords = useAppSelector(selectLocation);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    dispatch(locationSet({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    }));
                },
                () => {},
                {
                    enableHighAccuracy: true,
                    maximumAge: 0
                }
            )
        }
    }, [navigator]);

    return {
        latitude: coords.latitude,
        longitude: coords.longitude
    }
}

export {
    useOverlay
};