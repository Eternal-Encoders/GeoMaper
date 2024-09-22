import { Circle } from "react-konva";
import { Point } from "../../utils/interface";


function UserPoint({x, y}: Point) {
    return (
        <Circle
            x={x}
            y={y}
            radius={20}
            fill={"red"}
        />
    );
}

export default UserPoint