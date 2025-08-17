"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import React, { forwardRef, useCallback } from "react";
import { Button } from "../Button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
// import Link from "next/a";
import styles from "./NavBar.module.scss";
import Typography from "@/components/Typography";
import { useStageContext } from "@/components/StageContext";

const StageManagementLinks = ({ slug }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab");

  const { stageInfo } = useStageContext();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  return (
    <>
      {stageInfo && (
        <div className={styles.stageManagementLinks}>
          <button
            className={`${
              tab === "lobby" ? styles.activePageLink : styles.inactivePageLink
            }`}
            onClick={() => {
              // <pathname>?sort=asc
              router.push(pathname + "?" + createQueryString("tab", "lobby"));
            }}
          >
            <Typography variant="subheading">Lobby</Typography>
          </button>
          <button
            className={`${
              tab === "stage" ? styles.activePageLink : styles.inactivePageLink
            }`}
            onClick={() => {
              // <pathname>?sort=asc
              router.push(pathname + "?" + createQueryString("tab", "stage"));
            }}
          >
            <Typography variant="subheading">Stage</Typography>
          </button>
          <button
            className={`${
              tab === "stream" ? styles.activePageLink : styles.inactivePageLink
            }`}
            onClick={() => {
              // <pathname>?sort=asc
              router.push(pathname + "?" + createQueryString("tab", "stream"));
            }}
          >
            <Typography variant="subheading">Stream</Typography>
          </button>
        </div>
      )}
    </>
  );
};
export const NavBar = forwardRef((props, ref) => {
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  const isStageManagementPage = props.isStageManagementPage || false;

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
        <StageManagementLinks slug={pathname.split("/")[2]} />
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
