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

const formatTimeToLive = (timeToLive) => {
  const days = Math.floor(timeToLive / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeToLive % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeToLive % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeToLive % (1000 * 60)) / 1000);

  return `${days}D ${hours}H ${minutes}M ${seconds}S`;
};

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

const CountdownTimer = ({ startTime, slug, router, showState, programUrl }) => {
  const [timeToLive, setTimeToLive] = useState(
    new Date(startTime) - new Date(),
  );

  useEffect(() => {
    const updateTimeToLiveInterval = setInterval(() => {
      setTimeToLive(new Date(startTime) - new Date());
    }, 1000);

    return () => clearInterval(updateTimeToLiveInterval);
  }, [startTime]);

  return (
    <>
      {timeToLive < 0 && (
        <div className={styles.buttonContainer}>
          <Button
            variant="primary"
            size="large"
            onClick={() => router.push(`/${slug}/${showState}`)}
          >
            <Typography variant="buttonLarge">Enter Space</Typography>
          </Button>
          {programUrl && (
            <a
              href={programUrl} // Replace with the actual file path
              download
              target="_blank" // Open in a new tab
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                
              }} // Optional: Add a class for styling
            >
              <Button variant="secondary" size="large">
                <Typography variant="buttonLarge">Get Program</Typography>
              </Button>
            </a>
          )}
        </div>
      )}
      {timeToLive > 0 && (
        <Typography variant="subhero">
          {formatTimeToLive(timeToLive)}
        </Typography>
      )}
    </>
  );
};
const ShowPoster = ({ performanceInfo, router }) => {
  const [imageUrl] = useState(() => {
    const { data } = supabase.storage
      .from("assets")
      .getPublicUrl(
        `${performanceInfo.id}/${performanceInfo.poster_image_filename}`,
      );
    return data.publicUrl;
  });

  const [programUrl] = useState(() => {
    if (!performanceInfo.program_filename) return null;
    const { data } = supabase.storage
      .from("assets")
      .getPublicUrl(
        `${performanceInfo.id}/${performanceInfo.program_filename}`,
      );
    return data.publicUrl;
  });

  return (
    <div
      className={styles.showPoster}
      style={{ backgroundImage: `url(https://via.placeholder.com/150)` }}
    >
      <img
        src={imageUrl}
        alt="Show Poster"
        className={styles.showPosterImage}
      />

      <div className={styles.showInfo}>
        <div className={styles.creditsBlock}>
          <Credits credits={performanceInfo.credits} />
        </div>

        <div className={styles.dateTimeBlock}>
          <MarkdownTypography>
            {performanceInfo.datetime_info}
          </MarkdownTypography>
        </div>

        <div className={styles.titleBlock}>
          <Typography variant="hero">{performanceInfo.title}</Typography>
          <CountdownTimer
            startTime={performanceInfo.start_time}
            showState={performanceInfo.show_state}
            slug={performanceInfo.url_slug}
            programUrl={programUrl ? programUrl : null}
            router={router}
          />
        </div>
      </div>
    </div>
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
          <ShowPoster
            key={index}
            performanceInfo={performanceInfo}
            router={router}
          />
        );
      })}
    </div>
  );
}
