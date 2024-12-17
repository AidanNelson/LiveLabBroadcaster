"use client";
import { useRouter } from "next/navigation";
import Typography from "@/components/Typography";
import styles from "./LandingPage.module.css";
import { usePerformanceInfo } from "@/hooks/usePerformanceInfo";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/components/SupabaseClient";
import Markdown from "react-markdown";

// hero: "h1",
// subhero: "h2",
// title: "h3",
// subtitle: "h4",
// heading: "h5",
// subheading: "h6",
// body1: "p",
// body2: "p",
// body3: "p",
// buttonLarge: "span",
// buttonSmall: "span",

const MarkdownTypography = ({ children }) => {
  return (
    <Markdown
      components={{
        h6: ({ node, ...props }) => (
          <Typography
            variant="subheading"
            style={{ color: "var(--text-secondary-color)" }}
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <Typography variant="subtitle" {...props} />
        ),
        h3: ({ node, ...props }) => <Typography variant="title" {...props} />,
        p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
      }}
    >
      {children}
    </Markdown>
  );
};

const Credits = ({ credits }) => {
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      
      setCurrentPage((currentPage) => {
        const nextPage = (currentPage + 1) % credits.length;
                return nextPage;
    });
    }, 5000);

    return () => clearInterval(interval);
  },[setCurrentPage,credits]);
  return (
    <>
    <MarkdownTypography>{credits[currentPage]}</MarkdownTypography>
    </>
  );
};

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

const CountdownTimer = ({ startTime, slug, router }) => {
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
          <button
            className="buttonLarge"
            onClick={() => router.push(`/${slug}/lobby`)}
          >
            <Typography variant="buttonLarge">Enter Space</Typography>
          </button>
          <button className="buttonText">
            <Typography variant="buttonLarge">Get Program</Typography>
          </button>
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
        `${performanceInfo.stage_id}/${performanceInfo.poster_image_filename}`,
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
          <CountdownTimer startTime={performanceInfo.start_time} slug={performanceInfo.slug} router={router} />
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const { performancesInfo } = usePerformanceInfo();

  return (
    <div
      className={styles.landingPageContainer}
    >
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
