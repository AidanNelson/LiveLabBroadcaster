"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import React from "react";
import { Button } from "../Button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./NavBar.module.scss";
import { Typography } from "@mui/material";
import { useStageContext } from "@/components/StageContext";

const StageManagementLinks = ({ pathname, slug }) => {
  const { stageInfo } = useStageContext();

  return (
    <>
      {stageInfo && (
        <div className={styles.stageManagementLinks}>

          {/* <Typography variant="h6" component="div">
            {stageInfo.title}
          </Typography> */}
          <Link
            className={`${
              pathname.endsWith("lobby") ? styles.isActivePage : ""
            }`}
            href={`/admin/${stageInfo.url_slug}/lobby`}
          >
            <Button variant="secondary" size="small">
              Lobby
            </Button>
          </Link>
          <Link
            className={`${
              pathname.endsWith("stage") ? styles.isActivePage : ""
            }`}
            href={`/admin/${stageInfo.url_slug}/stage`}
          >
            <Button variant="secondary" size="small">
              Stage
            </Button>
          </Link>
          <Link
            className={`${
              pathname.endsWith("broadcast") ? styles.isActivePage : ""
            }`}
            href={`/admin/${stageInfo.url_slug}/broadcast`}
          >
            <Button variant="secondary" size="small">
              Broadcaster
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};
export const NavBar = () => {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  // hacky way to verify if this is a stage management page (such that we don't try to use stageContext otherwise)
  const isStageManagementPage =
    pathname.startsWith("/admin/") && pathname.split("/").length === 4;

  return (
    <div className={styles.navBarContainer}>
      <Link
        className={`${
          pathname.startsWith("/admin") && pathname.split("/").length === 2? styles.isActivePage : ""
        }`}
        href="/admin"
      >
        <Button variant="secondary" size="small">
          Home
        </Button>
      </Link>
      {isStageManagementPage && (
        <StageManagementLinks pathname={pathname} slug={pathname.split("/")[2]} />
      )}

      <Button variant="secondary" size="small" onClick={() => logout()}>
        Sign Out
      </Button>
    </div>
  );
};
