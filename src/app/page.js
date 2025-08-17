"use client";
import { useRouter } from "next/navigation";
import Typography from "@/components/Typography";
import styles from "./LandingPage.module.css";
import { useHomepageStageInfo } from "@/hooks/useHomepageStageInfo";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/components/SupabaseClient";
import { MarkdownTypography } from "@/components/MarkdownTypography";
import { Credits } from "@/components/Credits";

import { Button } from "@/components/Button";
import { ProductionPoster } from "@/components/ProductionPoster";

const HeroBanner = () => {
  return (
    <>
      <div className={styles.heroBanner}>
        <p className={styles.welcomeContainer}>
          {Array.from("Welcome To").map((letter, index) => {
            return (
              <span key={index} className={styles.welcomeLetter}>
                {letter}
              </span>
            );
          })}
        </p>
        <h1 className={styles.heroContainer}>
          {Array.from("La MaMa Online").map((letter, index) => {
            return (
              <span key={index} className={styles.heroLetter}>
                {letter}
              </span>
            );
          })}
        </h1>
        <p className={styles.poweredByText}>Powered by LiveLab Broadcaster</p>
      </div>
    </>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const { performancesInfo } = useHomepageStageInfo();

  return (
    <div className={styles.landingPageContainer}>
      <HeroBanner />
      {performancesInfo.map((performanceInfo, index) => {
        return (
          <ProductionPoster
            key={index}
            performanceInfo={performanceInfo}
            router={router}
          />
        );
      })}
    </div>
  );
}
