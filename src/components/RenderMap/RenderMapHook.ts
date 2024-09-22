import { useGetFloorQuery } from "../../features/api/apiSlice";
import { IAuditorium, IService, Point } from "../../utils/interface";
import { getAudiences, getService } from "../../utils/translateToKonva";
import { RefObject, useEffect, useState } from "react";
import { boundPosition, clampValue, getCenter, getDistance, rotateByAngle } from "../../utils/map";
import { MAX_SCALE, MIN_SCALE, ROTATION_THRESHOLD, SCALE_BY } from "../../utils/constants";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import { selectLocation } from "../../features/location/locationSlice";
import { pointPush } from "../../features/points/pointsSlice";

import Konva from "konva";
import { fromSphericalToRect } from "../../utils/gps";

function useRenderMap(
    stageRef: RefObject<Konva.Stage>,
    width: number,
    height: number,
    windowWidth: number,
    windowHeight: number
) {
    const dispatch = useAppDispatch();

    const coords = useAppSelector(selectLocation);

    let lastCenter: Point | null = null;
    let tempRotation = 0;
    let lastDist = 0;
    let lastAngle: number | null = null;

    function addPointToPoints(x: number, y: number) {
        const geoCoords = fromSphericalToRect(coords);
        dispatch(pointPush({
            x: x,
            y: y,
            geoX: geoCoords.x,
            geoY: geoCoords.y,
            geoZ: geoCoords.z
        }));
    }
    
    function handelWheel(event: Konva.KonvaEventObject<WheelEvent>) {
        event.evt.preventDefault();

        const stage = stageRef.current;

        if (!stage || stage === null) { return; }

        const oldScale = stage.scaleX();
        const pointerPos = stage.getPointerPosition();
        const rotation = stage.getAbsoluteRotation();

        if (!pointerPos) { return; }

        const mousePointTo = {
            x: (pointerPos.x - stage.x()) / oldScale,
            y: (pointerPos.y - stage.y()) / oldScale,
        };

        const newScale = event.evt.deltaY < 0 ? oldScale * SCALE_BY : oldScale / SCALE_BY;
        const scale = clampValue(newScale, MIN_SCALE, MAX_SCALE);

        const newPos = {
            x: pointerPos.x - mousePointTo.x * scale,
            y: pointerPos.y - mousePointTo.y * scale,
        }
        const pos = boundPosition(
            newPos,
            width,
            height,
            scale,
            rotation,
            windowWidth,
            windowHeight
        );

        stage.scale({ x: scale, y: scale });
        stage.position(pos);
        stage.batchDraw();
    }

    function handleTouch(e: Konva.KonvaEventObject<TouchEvent>) {
        e.evt.preventDefault();

        const touch1 = e.evt.touches[0];
        const touch2: Touch | undefined = e.evt.touches[1];
        const stage = stageRef.current;

        if (!stage || stage === null) { return; }

        stage.stopDrag();

        const p1 = {
            x: touch1.clientX,
            y: touch1.clientY
        };
        const p2 = {
            x: touch2 ? touch2.clientX : touch1.clientX,
            y: touch2 ? touch2.clientY : touch1.clientY
        };

        const oldScale = stage.scaleX();

        const newCenter = getCenter(p1, p2);
        if (!lastCenter) {
            lastCenter = newCenter;
        }

        const arcCos1 = touch2 ? Math.acos((p1.x - newCenter.x) / getDistance(p1, newCenter)) : 0;
        const newAngle = (p1.y - newCenter.y < 0 ? 2*Math.PI - arcCos1: arcCos1) * (180 / Math.PI);
        if(!lastAngle) {
            lastAngle = newAngle;
        }

        const deltaAngle = newAngle - lastAngle;

        const dist = getDistance(p1, p2);
        if (!lastDist) {
            lastDist = dist;
        }

        const pointTo = {
            x: (newCenter.x - stage.x()) / oldScale,
            y: (newCenter.y - stage.y()) / oldScale
        };

        const delta = lastDist === 0 ? 1 : (dist / lastDist)
        const newScale = oldScale * delta;
        const scale = clampValue(newScale, MIN_SCALE, MAX_SCALE);

        const dx = newCenter.x - lastCenter.x;
        const dy = newCenter.y - lastCenter.y;

        const newPos = {
            x: newCenter.x - pointTo.x * scale + dx,
            y: newCenter.y - pointTo.y * scale + dy
        };

        let angle = 0;

        if (Math.abs(tempRotation) <= ROTATION_THRESHOLD) {
            tempRotation += deltaAngle;
        } else {
            angle = deltaAngle;
        }

        const rotatedPos = rotateByAngle(newPos, newCenter, angle);
        const pos = boundPosition(
            rotatedPos,
            width,
            height,
            scale,
            stage.getAbsoluteRotation() + angle,
            windowWidth,
            windowHeight
        );

        stage.scale({x: scale, y: scale});
        stage.rotate(angle);
        stage.position(pos);
        stage.batchDraw();

        lastDist = dist;
        lastAngle = newAngle;
        lastCenter = newCenter;
    }

    function handleClick(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
        e.evt.preventDefault();

        const stage = stageRef.current;

        if (!stage || stage === null) { return; }

        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) { return; }
        const scale = stage.getAbsoluteScale().x;

        const pos = {
            x: clampValue((pointerPos.x - stage.x()) / scale, 0, width),
            y: clampValue((pointerPos.y - stage.y()) / scale, 0, height)
        };

        addPointToPoints(pos.x, pos.y);
    }

    function handleTouchEnd() {
        lastCenter = null;
        lastDist = 0;
        lastAngle = null;
        tempRotation = 0;
    }

    function handelDragBound(this: Konva.Node, pos: Konva.Vector2d) {
        return boundPosition(
            pos, 
            width,
            height,
            this.getAbsoluteScale().x, 
            this.getAbsoluteRotation(), 
            windowWidth,
            windowHeight
        );
    }

    return {
        userPoint: coords,
        handelWheel,
        handleTouch,
        handleTouchEnd,
        handleClick,
        handelDragBound
    }
}

function useMapInitiate(
    stageRef: RefObject<Konva.Stage>,
    instName: string, 
    instFloorNum: number
) {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [audiences, setAudiences] = useState<IAuditorium[]>([]);
    const [service, setService] = useState<IService[]>([]);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const { data } = useGetFloorQuery({
        inst: instName,
        floor: instFloorNum
    })

    /* ON MOUNT */
    useEffect(() => {
        if (data && stageRef && stageRef.current) {
            setAudiences(data.audiences);
            setService(data.service);
            setWidth(data.width);
            setHeight(data.height);

            const newScale = Math.min(windowWidth, windowHeight) / Math.min(data.width, data.height);
            const newX = (windowWidth / 2) - (data.width * newScale / 2)
            const newY = (windowHeight / 2) - (data.height * newScale / 2)

            stageRef.current.scale({
                x: newScale,
                y: newScale
            });
            stageRef.current.position({
                x: newX,
                y: newY
            });
            stageRef.current.batchDraw();
        }
    }, [data, stageRef]);

    /* ON RESIZE */
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        }
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [window]);

    return {
        audiences: getAudiences(audiences),
        service: getService(service),
        windowWidth,
        windowHeight,
        width,
        height
    }
}

export {
    useRenderMap,
    useMapInitiate
}