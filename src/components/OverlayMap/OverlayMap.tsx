import { Box, Grid2, Typography } from "@mui/material";
import { useOverlay } from "./OverlayHook";
import { fromSphericalToRect } from "../../utils/gps";

function OveralyMap() {
    const {
        latitude,
        longitude,
        altitude
    } = useOverlay();

    const rectCoords = fromSphericalToRect({
        latitude,
        longitude,
        altitude
    });

    return (
        <div 
            style={{
                position: "absolute",
                zIndex: 100,
                userSelect: "none",
                WebkitUserSelect: "none",
                msUserSelect: "none"
            }}
            onClick={(e) => {
                e.preventDefault()
            }}
        >
            <Grid2 container>
                <Grid2>
                    <Box>
                        <Typography component="span" mr={1.5}>
                            Latitude
                        </Typography>
                        <Typography component="span">
                            {rectCoords.x}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography component="span" mr={1.5}>
                            Longitude
                        </Typography>
                        <Typography component="span">
                            {rectCoords.y}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography component="span" mr={1.5}>
                            Altitude
                        </Typography>
                        <Typography component="span">
                            {rectCoords.z}
                        </Typography>
                    </Box>
                </Grid2>
            </Grid2> 
        </div>
    );
}

export default OveralyMap;