import Header from "./Header";
import { Outlet } from "react-router-dom";

//Code to reduce Header syntax on all other components
export default function Layout() {
    return (
        <main>
            <Header />
            <Outlet />
        </main>
    )
}