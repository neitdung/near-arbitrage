import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import React from "react";
import backgroundImage from "src/public/static/img/bg_4.png";
import Box from "@mui/material/Box";

export default function NotLoggedIn({wallet}) {
    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                pt: 8,
                pb: 6,
                backgroundImage:`url(${backgroundImage.src})`
            }}
        >
            <Container>
                <Stack
                    sx={{ pt: 4, color: "white" }}
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                >
                    <Button variant="contained" onClick={() => wallet.signIn()}>Connect wallet to continue</Button>
                </Stack>
            </Container>
        </Box>
    )
}