import { useAuthContext } from "@/components/AuthContextProvider";
import React from "react";
import { Button } from "../Button";
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import styles from "./NavBar.module.scss"

export const NavBar = () => {
    const {user, logout} = useAuthContext();

    return (
        <div className={styles.navBarContainer}>
            <Button variant="secondary" size="small" >
                Home
            </Button>
            <Button variant="secondary" size="small" >
                Link1
            </Button>
            <Button variant="secondary" size="small" >
                Link2
            </Button>
            <Button variant="secondary" size="small" onClick={() => logout()}>
                Sign Out
            </Button>


        </div>
    )

}