"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import React, {forwardRef} from "react";
import { Button } from "../Button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
// import Link from "next/a";
import styles from "./NavBar.module.scss";
import Typography from "@/components/Typography";
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
          <a
            // target="_blank"
            // rel="noopener noreferrer"
            className={`${
              pathname.endsWith("lobby")
                ? styles.activePageLink
                : styles.inactivePageLink
            }`}
            href={`/admin/${stageInfo.url_slug}/lobby`}
          >
            <Typography variant="subheading">Lobby</Typography>
          </a>
          <a
            // target="_blank"
            // rel="noopener noreferrer"
            className={`${
              pathname.endsWith("stage")
                ? styles.activePageLink
                : styles.inactivePageLink
            }`}
            href={`/admin/${stageInfo.url_slug}/stage`}
          >
            <Typography variant="subheading">Stage</Typography>
          </a>
          <a
            // target="_blank"
            // rel="noopener noreferrer"
            className={`${
              pathname.endsWith("broadcast")
                ? styles.activePageLink
                : styles.inactivePageLink
            }`}
            href={`/admin/${stageInfo.url_slug}/broadcast`}
          >
            <Typography variant="subheading">Stream</Typography>
          </a>
        </div>
      )}
    </>
  );
};
export const NavBar =  forwardRef((props, ref) => {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  // hacky way to verify if this is a stage management page (such that we don't try to use stageContext otherwise)
  const isStageManagementPage =
    pathname.startsWith("/admin/") && pathname.split("/").length === 4;

  return (
    <div ref={ref} id="navBar" className={styles.navBarContainer}>
      <a
        className={`${
          pathname.startsWith("/admin") && pathname.split("/").length === 2
            ? styles.activePageLink
            : styles.inactivePageLink
        }`}
        href="/admin"
      >
        <Typography variant="subheading">Home</Typography>
      </a>
      {isStageManagementPage && (
        <StageManagementLinks
          pathname={pathname}
          slug={pathname.split("/")[2]}
        />
      )}

      <a
        className={`${styles.inactivePageLink}`}
        href="/"
        onClick={() => {
          logout();
        }}
      >
        <Typography variant="subheading">Sign Out</Typography>
      </a>
    </div>
  );
});
