import { useNavigate, useParams } from "react-router-dom";
import OveralyMap from "../../components/OverlayMap/OverlayMap";
import RenderMap from "../../components/RenderMap/RenderMap";

function InstitutePage() {
    const { instName, instFloor } = useParams<{
        instName: string,
        instFloor: string
    }>();
    const navigate = useNavigate();

    const instFloorNum = Number(instFloor);
    const isNotFound = !instName || !Number.isInteger(instFloorNum);

    if (isNotFound) {
        return navigate("not-found");
    } else {
        return (
            <>
                <OveralyMap />
                <RenderMap  instName={instName} instFloorNum={instFloorNum} />
            </>
        );
    }
}

export default InstitutePage;