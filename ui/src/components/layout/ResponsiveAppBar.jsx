import React, { useState, useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { appStore } from "../../state/app";
import NextLink from "next/link";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SwapCallsIcon from "@mui/icons-material/SwapCalls";
const pages = [
    { url: "/pools", label: "Pools" },
    { url: "/activities", label: "Activities" },
    {
        label: "Factory",
        children: [
            { url: "/factory", label: "All FTs" },
            { url: "/factory/create", label: "Create new FT" },
        ],
    },
];

const ResponsiveAppBar = () => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElPage, setAnchorElPage] = React.useState(null);
    const [pageOpen, setPageOpen] = React.useState(-1);

    const [profile, setProfile] = useState(false);
    const { state } = useContext(appStore);

    const { wallet, account } = state;

    const signedIn = wallet && wallet.signedIn;

    if (profile && !signedIn) {
        setProfile(false);
    }

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenPageMenu = (event, index) => {
        setAnchorElPage(event.currentTarget);
        setPageOpen(index);
    };

    const handleClosePageMenu = () => {
        setAnchorElPage(null);
        setPageOpen(-1);
    };

    const pageList = pages.map((page, index) => {
        if (!page.children) {
            return (
                <MenuItem key={page.url} onClick={handleCloseNavMenu}>
                    <NextLink href={page.url} as={page.url}>
                        <Typography textAlign="center">{page.label}</Typography>
                    </NextLink>
                </MenuItem>
            );
        }
        return (
            <div>
                <Button
                    sx={{
                        color: "white",
                        px: 2,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 400,
                    }}
                    key={page.label}
                    aria-controls={page.label}
                    aria-haspopup="true"
                    aria-expanded={pageOpen == index ? "true" : undefined}
                    disableElevation
                    onClick={(e) => handleOpenPageMenu(e, index)}
                    endIcon={<KeyboardArrowDownIcon />}
                >
                    {page.label}
                </Button>
                <Menu
                    anchorEl={anchorElPage}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                    }}
                    open={Boolean(anchorElPage) && index == pageOpen}
                    onClose={handleClosePageMenu}
                >
                    {page.children.map((child) => (
                        <NextLink key={`${child.url}_link`} href={child.url} as={child.url}>
                            <MenuItem key={child.url}>{child.label}</MenuItem>
                        </NextLink>
                    ))}
                </Menu>
            </div>
        );
    });

    return (
        <AppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <NextLink href={"/"} as={"/"}>
                        <Button
                            variant="outlined"
                            startIcon={<SwapCallsIcon />}
                            sx={{
                                mr: 1,
                                backgroundColor: "white",
                                borderColor: "black",
                                borderWidth: 1,
                                color: "primary",
                                "&:hover": {
                                    backgroundColor: "white",
                                },
                            }}
                        >
                            Swap
                        </Button>
                    </NextLink>
                    <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: "block", md: "none" },
                            }}
                        >
                            {pageList}
                        </Menu>
                    </Box>
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                        {pageList}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
export default ResponsiveAppBar;
