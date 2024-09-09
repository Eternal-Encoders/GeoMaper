import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <Container>
            <Typography variant="h1">
                Такой старинцы нет
            </Typography>
            <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate("/")}
            >
                На главную
            </Button>
        </Container>
    );
}

export default NotFoundPage;