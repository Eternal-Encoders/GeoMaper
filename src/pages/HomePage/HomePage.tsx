import { Box, Button, Container, Divider, Grid2, Typography } from "@mui/material";
import { useGetInstitutesQuery } from "../../features/api/apiSlice";
import { useNavigate } from "react-router-dom";
import { getOrigin } from "../../utils/network";

function HomePage() {
    const navigate = useNavigate();

    const { data } = useGetInstitutesQuery(undefined);

    return (
        <Container>
            {data &&
                <Grid2 container columnSpacing={10} columns={6}>
                    {data.map((e) => {
                        const listItems = [];
                        for (let i = e.minFloor; i <= e.maxFloor; i++) {
                            listItems.push(
                                <Button 
                                    variant="contained"
                                    onClick={() => {navigate(`insitute/${e.name}/${i}`)}}
                                    key={e.url + i}
                                >
                                    {i}
                                </Button>
                            );
                        }

                        return (
                            <Grid2 key={e.url} container direction="column" spacing={1}>
                                    <Divider orientation="vertical" variant="middle" />

                                    <Box mb={4}>
                                        <Box
                                            component="img"
                                            src={`${getOrigin()}/icons/${e.icon.url}`}
                                            alt={e.icon.alt}
                                        />
                                        <Typography 
                                            variant="body1"
                                            sx={{
                                                textAlign: "center"
                                            }}
                                        >
                                            {e.displayableName}
                                        </Typography>
                                    </Box>
                                    
                                    {listItems}

                                    <Divider orientation="vertical" variant="middle" />
                            </Grid2>
                        )
                    })}
                </Grid2>
            }
        </Container>
    );
}

export default HomePage;