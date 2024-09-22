import { Layer, Stage } from "react-konva";
import { useMapInitiate, useRenderMap } from "./RenderMapHook";
import { useRef } from "react";
import Konva from "konva";
import { useAppSelector } from "../../store/hook";
import { selectAllPoints } from "../../features/points/pointsSlice";
import { getGeoMapPoints, getUserPoint } from "../../utils/translateToKonva";
import { getInterpolator } from "../../utils/interpolation";
import { getRegressor, fromSphericalToRect } from "../../utils/gps";

interface RenderMapProps {
    instName: string,
    instFloorNum: number
}

function RenderMap({instName, instFloorNum}: RenderMapProps) {
    const stageRef = useRef<Konva.Stage>(null);

    const { 
        audiences, 
        service,
        windowWidth,
        windowHeight,
        width,
        height
    } = useMapInitiate(stageRef, instName, instFloorNum);

    const {
        userPoint,
        handelWheel,
        handleTouch,
        handleTouchEnd,
        handleClick,
        handelDragBound
    } = useRenderMap(
        stageRef,
        width,
        height,
        windowWidth,
        windowHeight
    );

    const points = useAppSelector(selectAllPoints);
    const userPointRect = fromSphericalToRect(userPoint);
    const locationRegressor = points.length >= 3 ? getRegressor(points) : undefined;
    const interpolator = points.length > 0 && locationRegressor ? getInterpolator(points, locationRegressor) : undefined;

    return (
        <Stage
            width={windowWidth - 16}
            height={windowHeight - 16}
            onWheel={handelWheel}
            onTouchMove={handleTouch}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            onTap={handleClick}
            dragBoundFunc={handelDragBound}
            draggable
            ref={stageRef}
        >
            <Layer key={"map"}>
                {audiences}
                {service}
            </Layer>
            <Layer key={"points"}>
                {interpolator &&
                    getUserPoint(interpolator(userPointRect))
                }
                {getGeoMapPoints(points)}
            </Layer>
        </Stage>
    );
}

export default RenderMap;