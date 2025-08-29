"use client";
import { useAuthContext } from "@/components/AuthContextProvider";
import { forwardRef, useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./NavBar.module.scss";
import Typography from "@/components/Typography";
import { useStageContext } from "@/components/StageContext";


const StageManagementLinks = ({ slug }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [tabs, _] = useState(["Lobby", "Stage", "Stream"]);

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
        <div className={`${styles.stageManagementLinks}`}>
          {tabs.map((tabName) => (
            <button
              key={tabName}
              className={`${
                tab === tabName.toLowerCase()
                  ? styles.activePageLink
                  : styles.inactivePageLink
              }
              p-4 `}
              onClick={() => {
                router.push(
                  pathname + "?" + createQueryString("tab", tabName.toLowerCase()),
                );
              }}
            >
              <Typography variant="subheading">{tabName}</Typography>
            </button>
          ))}
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
