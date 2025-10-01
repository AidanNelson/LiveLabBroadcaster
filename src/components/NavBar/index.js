"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import { forwardRef, useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./NavBar.module.scss";
import Typography from "@/components/Typography";
import { useStageContext } from "@/components/StageContext";
import { useAudienceCountsContext } from "../AudienceCountContext";

const StageManagementLinks = ({ slug }) => {
  const pathname = usePathname();

  const { audienceCounts } = useAudienceCountsContext();
  const { stageInfo } = useStageContext();


  return (
    <>
      {stageInfo && (
        <div className={`${styles.stageManagementLinks}`}>
          {["Lobby", "Stage", "Stream"].map((name) => (
            <Link
              key={name}
              href={`/admin/live/${slug}/${name.toLowerCase()}`}
              className={`${
                pathname.startsWith(`/admin/live/${slug}/${name.toLowerCase()}`)
                  ? styles.activePageLink
                  : styles.inactivePageLink
              } p-4`}
            >
              <Typography variant="subheading">
                {name}{" "}
                {name !== "Stream" &&
                  "(" + audienceCounts[name.toLowerCase()] + ")"}
              </Typography>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};
export const NavBar = forwardRef((props, ref) => {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();



  const isStageManagementPage = props.isStageManagementPage || false;

  return (
    <div ref={ref} id="navBar" className={styles.navBarContainer}>
      <Link
        href="/admin"
      >
        <Typography variant="subheading">Home</Typography>
      </Link>
      {isStageManagementPage && (
        <StageManagementLinks slug={pathname.split("/")[3]} />
      )}

      <Link
        className={`${styles.inactivePageLink}`}
        href="/"
        onClick={() => {
          logout();
        }}
      >
        <Typography variant="subheading">Sign Out</Typography>
      </Link>
    </div>
  );
});
