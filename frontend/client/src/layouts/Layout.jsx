import Header from "./Header";
import { Outlet } from "react-router-dom";
import { Box } from '@chakra-ui/react';

//Code to reduce Header syntax on all other components
export default function Layout() {
    return (
        <Box as="main">
            <Header />
            <Outlet />
        </Box>
    )
}