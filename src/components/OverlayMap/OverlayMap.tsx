import { Box, Grid2, Typography } from "@mui/material";
import { useOverlay } from "./OverlayHook";

function OveralyMap() {
    const {
        latitude,
        longitude
    } = useOverlay();

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
                            {latitude}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography component="span" mr={1.5}>
                            Longitude

                        </Typography>
                        <Typography component="span">
                            {longitude}
                        </Typography>
                    </Box>
                </Grid2>
            </Grid2> 
        </div>
    );
}

export default OveralyMap;