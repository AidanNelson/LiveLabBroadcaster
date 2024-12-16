"use client";
import { useRouter } from "next/navigation";
import Typography from "@/components/Typography";
import styles from "./LandingPage.module.css";

const HeroBanner = () => {
  return (
    <>
      <p className={styles.welcomeContainer}>{Array.from("Welcome To").map((letter, index) => {
          return (
            <span key={index} className={styles.welcomeLetter}>
              {letter}
            </span>
          );
        })}</p>

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
    </>
  );
};

const ShowPoster = ({ router }) => {
  const isLive = true;
  return (
    <div
      className={styles.showPoster}
      style={{ backgroundImage: `url(https://via.placeholder.com/150)` }}
    >
      <img
        src="https://backend.sheepdog.work/storage/v1/object/public/assets/c8048812-3941-418b-92f6-219cc8e305fd/MjIyMjIuanBlZw=="
        alt="Show Poster"
        className={styles.showPosterImage}
      />

      <div className={styles.showInfo}>
        <div className={styles.credits}>
          <Typography
            variant="subtitle"
            style={{
              color: "var(--text-secondary-color)",
            }}
          >
            Presented by
          </Typography>
          <Typography variant="subtitle">La MaMa & CultureHub</Typography>
          <Typography
            variant="subtitle"
            style={{
              color: "var(--text-secondary-color)",
            }}
          >
            in association with
          </Typography>
          <Typography variant="subtitle">
            The Polish Cultural Institute New York
          </Typography>
        </div>

        <div className={styles.dateTimeBlock}>
          <Typography variant="title">
            June 1 - 3<br />
            7pm ET
          </Typography>
        </div>

        <div className={styles.titleBlock}>
          <Typography variant="hero">Show Title</Typography>
          {isLive && (
            <div className={styles.buttonContainer}>
              <button
                className="buttonLarge"
                onClick={() => router.push(`/abc/lobby`)}
              >
                <Typography variant="buttonLarge">Enter Space</Typography>
              </button>
              <button className="buttonText">
                <Typography variant="buttonLarge">Get Program</Typography>
              </button>
            </div>
          )}
          {!isLive && <Typography variant="subhero">3D 4H 12M 28S</Typography>}
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();

  const CurrentShowInfo = [
    {
      id: "12345",
      title: "Show Title",
      description: "Show Description",
      posterImage: "https://via.placeholder.com/250",
      startTime: "2021-09-01T20:00:00Z",
      credits: "Credits",
      timeAndDateText: "June 1 - 3, 7pm ET",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "90vw",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <HeroBanner />
      {CurrentShowInfo.map((showInfo, index) => {
        return <ShowPoster key={index} showInfo={showInfo} router={router} />;
      })}
    </div>
  );
}
