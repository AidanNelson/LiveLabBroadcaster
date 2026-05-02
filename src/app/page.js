"use client";

import { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";

const ABOUT_COPY = `LiveLab Broadcaster is a low-latency livestreaming platform that allows for  interactivity with online audiences developed by CultureHub with support from NYU's Interactive Telecommunications Program (ITP).`;

const GITHUB_URL = "https://github.com/aidannelson/livelabbroadcaster";

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
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setAboutOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen]);

  return (
    <div className={styles.landingPageRoot}>
      <div className={`text-foreground ${styles.landingPageContainer}`}>
        <HeroBanner />

        <button
          type="button"
          className={styles.aboutLink}
          onClick={() => setAboutOpen(true)}
        >
          About
        </button>

        {aboutOpen ? (
          <div
            className={styles.aboutModalBackdrop}
            onClick={() => setAboutOpen(false)}
            role="presentation"
          >
            <div
              className={styles.aboutModalContent}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-modal-title"
            >
              <button
                type="button"
                className={styles.aboutModalClose}
                onClick={() => setAboutOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 id="about-modal-title" className={styles.aboutModalTitle}>
                About
              </h2>
              <p className={styles.aboutModalBody}>{ABOUT_COPY}</p>
              <p className={styles.aboutModalLearnMore}>
                Learn more at our &nbsp;
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.aboutModalLink}
                >
                  Github repository
                </a>
                .
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
