import { Circle } from "react-konva";
import { GeoPoint } from "../../utils/interface";


function GeoMapPoint({x, y}: GeoPoint) {
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