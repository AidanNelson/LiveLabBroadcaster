"use client";
import Typography from "@/components/Typography";
import styles from "./ProductionPoster.module.scss";
import { useState, useEffect } from "react";
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

const CountdownTimer = ({ performanceInfo, router }) => {
  const [timeToLive, setTimeToLive] = useState(
    new Date(performanceInfo.start_time) - new Date(),
  );

  const [downloadUrl] = useState(() => {
    if (
      !performanceInfo?.additional_production_info?.type === "downloadable" ||
      !performanceInfo?.additional_production_info?.filename
    )
      return null;
    const { data } = supabase.storage
      .from("assets")
      .getPublicUrl(
        `${performanceInfo.id}/${performanceInfo.additional_production_info.filename}`,
      );
    return data.publicUrl;
  });

  useEffect(() => {
    const updateTimeToLiveInterval = setInterval(() => {
      setTimeToLive(new Date(performanceInfo.start_time) - new Date());
    }, 1000);

    return () => clearInterval(updateTimeToLiveInterval);
  }, [performanceInfo.start_time]);

  return (
    <>
      <div className={styles.buttonContainer}>
        {timeToLive < 0 && (
          <Button
            variant="primary"
            size="large"
            onClick={() => {
              if (!router) return;
              router.push(
                `/${performanceInfo.url_slug}/${performanceInfo.show_state}`,
              )
            }}
          >
            <Typography variant="buttonLarge">Enter Space</Typography>
          </Button>
        )}
        {timeToLive > 0 && (
          <Typography variant="subhero">
            {formatTimeToLive(timeToLive)}
          </Typography>
        )}
        {performanceInfo?.additional_production_info?.type ===
          "downloadable" && (
            <a
              href={downloadUrl} // Replace with the actual file path
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
        {performanceInfo?.additional_production_info?.type ===
          "externalLink" && (
            <a
              href={performanceInfo?.additional_production_info?.url} // Replace with the actual file path
              download
              target="_blank" // Open in a new tab
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
              }}
            >
              <Button variant="secondary" size="large">
                <Typography variant="buttonLarge">Learn More</Typography>
              </Button>
            </a>
          )}
      </div>
    </>
  );
};

export const ProductionPoster = ({ performanceInfo, router }) => {
  const [imageUrl] = useState(() => {
    const { data } = supabase.storage
      .from("assets")
      .getPublicUrl(
        `${performanceInfo.id}/${performanceInfo.poster_image_filename}`,
      );
    return data.publicUrl;
  });

  return (
    <div
      className={styles.productionPoster}
      style={{ backgroundImage: `url(https://via.placeholder.com/150)` }}
    >
      <img
        src={imageUrl}
        alt="Show Poster"
        className={styles.productionPosterImage}
      />

      <div className={styles.productionInfoOverlay}>
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
          <CountdownTimer performanceInfo={performanceInfo} router={router} />
        </div>
      </div>
    </div>
  );
};
