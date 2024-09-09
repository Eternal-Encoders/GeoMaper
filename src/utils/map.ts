import { POSITION_THRESHOLD } from "./constants";
import { Point } from "./interface";

function getDistance(p1: Point, p2: Point) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCenter(p1: Point, p2: Point): Point {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    };
}

function clampValue(value: number, minValue: number, maxValue: number) {
    return Math.min(Math.max(value, minValue), maxValue);
}

function rotateByAngle(position: Point, rotationPoint: Point, rotationAngle: number): Point {
    return {
        x: rotationPoint.x + 
            (position.x - rotationPoint.x) * Math.cos(rotationAngle / 180 * Math.PI) - 
            (position.y - rotationPoint.y) * Math.sin(rotationAngle / 180 * Math.PI),
        y: rotationPoint.y + 
            (position.x - rotationPoint.x) * Math.sin(rotationAngle / 180 * Math.PI) +
            (position.y - rotationPoint.y) * Math.cos(rotationAngle / 180 * Math.PI)
    }
}

function getBoundaries(
    width: number, 
    height: number,
    scale: number,
    rotationAngle: number
) {
    const rectanglePoints = {
        topLeft: {x: 0, y: 0},
        topRight: {x: -width * scale, y: 0},
        leftBottom: {x: 0, y: -height * scale},
        rightBottom: {x: -width * scale, y: -height * scale},
    }

    const rotatedMappoints = [
        rotateByAngle(rectanglePoints.topLeft, rectanglePoints.topLeft, rotationAngle),
        rotateByAngle(rectanglePoints.topRight, rectanglePoints.topLeft, rotationAngle),
        rotateByAngle(rectanglePoints.leftBottom, rectanglePoints.topLeft, rotationAngle),
        rotateByAngle(rectanglePoints.rightBottom, rectanglePoints.topLeft, rotationAngle),
    ];

    let left = Number.MIN_VALUE;
    let top = Number.MIN_VALUE;
    let right = Number.MAX_VALUE;
    let bottom = Number.MAX_VALUE;

    rotatedMappoints.forEach((e) => {
        left = Math.max(left, e.x);
        top = Math.max(top, e.y);
        right = Math.min(right, e.x);
        bottom = Math.min(bottom, e.y);
    });

    return {
        left,
        top,
        right,
        bottom
    }
}

function boundPosition(
    pos: Point, 
    width: number, 
    height: number,
    scale: number,
    rotationAngle: number,
    cameraWidth: number,
    cameraHeight: number
) {
    const bounds = getBoundaries(width, height, scale, rotationAngle);

    const viewRect = {
        left: bounds.left + cameraWidth - POSITION_THRESHOLD,
        top: bounds.top + cameraHeight - POSITION_THRESHOLD,
        right: bounds.right + POSITION_THRESHOLD,
        bottom: bounds.bottom + POSITION_THRESHOLD
    }

    return {
        x: clampValue(
            pos.x,
            viewRect.right,
            viewRect.left
        ),
        y: clampValue(
            pos.y,
            viewRect.bottom,
            viewRect.top,
        )
    };
}

export {
    getDistance,
    getCenter,
    clampValue,
    rotateByAngle,
    getBoundaries,
    boundPosition
}