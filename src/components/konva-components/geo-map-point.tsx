import { Circle } from "react-konva";
import { MaperPoint } from "../../utils/interface";


function GeoMapPoint({x, y}: MaperPoint) {
    return (
        <Circle
            x={x}
            y={y}
            radius={20}
            stroke={"#000000"}
            strokeWidth={8}
        />
    );
}

export default GeoMapPoint