import { Box, Button, Grid2, Typography } from "@mui/material";
import { useOverlay } from "./OverlayHook";
import { flattenSpherical } from "../../utils/gps";
import { useAppSelector } from "../../store/hook";
import { selectAllPoints } from "../../features/points/pointsSlice";

interface OveralyMapProps {
    instName: string,
    instFloorNum: number
}

function OveralyMap({instName, instFloorNum}: OveralyMapProps) {
    const {
        latitude,
        longitude,
        altitude
    } = useOverlay();
    const points = useAppSelector(selectAllPoints);

    const rectCoords = flattenSpherical({
        latitude,
        longitude,
        altitude
    });

    function handelOnClick() {
        const link = document.createElement("a");
        const newFile = new Blob([JSON.stringify(points)], { type: "application/json" });
        link.href = URL.createObjectURL(newFile);
        link.download = `${instName}_${instFloorNum}.json`;
        link.click();
    }

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
                            X
                        </Typography>
                        <Typography component="span">
                            {rectCoords.x}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography component="span" mr={1.5}>
                            Y
                        </Typography>
                        <Typography component="span">
                            {rectCoords.y}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography component="span" mr={1.5}>
                            Z
                        </Typography>
                        <Typography component="span">
                            {rectCoords.z}
                        </Typography>
                    </Box>
                    <Button variant="contained" onClick={handelOnClick}>
                        Скачать точки
                    </Button>
                </Grid2>
            </Grid2> 
        </div>
    );
}

export default OveralyMap;