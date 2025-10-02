import { useEffect, useRef } from "react";
import { useUserMediaContext } from "@/components/UserMediaContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

const BOOLEAN_CONSTRAINTS = [
  "echoCancellation",
  "noiseSuppression",
  "autoGainControl",
  "voiceIsolation",
];
export const AudioConstraintsSelector = ({disabled = false}) => {
  const {
    availableAudioDeviceContraints,
    currentAudioDeviceSettings,
    desiredAudioDeviceConstraints,
    setDesiredAudioDeviceConstraints,
  } = useUserMediaContext();

  useEffect(() => {
    console.log(currentAudioDeviceSettings);
  }, [currentAudioDeviceSettings]);

  const handleConstraintChange = (constraintName, value) => {
    setDesiredAudioDeviceConstraints(prev => ({
      ...prev,
      [constraintName]: value
    }));
  };

  // Filter to only show boolean constraints
  const booleanConstraints = Object.entries(availableAudioDeviceContraints).filter(
    ([key, value]) => BOOLEAN_CONSTRAINTS.includes(key)
  );

  if (booleanConstraints.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 w-full mt-8">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Desired Audio Processing Options
      </h3>
      {booleanConstraints.map(([constraintName, defaultValue]) => (
        <div key={constraintName} className="flex items-center justify-between">
          <label 
            htmlFor={constraintName}
            className="text-sm text-gray-600 dark:text-gray-400 capitalize"
          >
            {constraintName.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <Switch
            id={constraintName}
            disabled={disabled}
            checked={desiredAudioDeviceConstraints[constraintName] || false}
            onCheckedChange={(checked) => handleConstraintChange(constraintName, checked)}
          />
        </div>
      ))}
    </div>
  );
};
export const MediaDeviceSelector = ({disabled = false}) => {
  const {
    devicesInfo,
    switchDevice,
    hasRequestedMediaDevices,
    setHasRequestedMediaDevices,
    currentVideoDeviceId,
    currentAudioDeviceId,
  } = useUserMediaContext();

  return (
    <>
      <div className="flex flex-col gap-4 w-full mt-8">
        <div className="w-full flex gap-4 items-center">
          <label htmlFor="videoSource" className="sr-only">
            Camera
          </label>
          <span className="w-[10%] flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="28"
              viewBox="0 0 32 28"
              fill="none"
            >
              <path
                d="M30.6668 23.3333C30.6668 24.0406 30.3859 24.7189 29.8858 25.219C29.3857 25.719 28.7074 26 28.0002 26H4.00016C3.29292 26 2.61464 25.719 2.11454 25.219C1.61445 24.7189 1.3335 24.0406 1.3335 23.3333V8.66667C1.3335 7.95942 1.61445 7.28115 2.11454 6.78105C2.61464 6.28095 3.29292 6 4.00016 6H9.3335L12.0002 2H20.0002L22.6668 6H28.0002C28.7074 6 29.3857 6.28095 29.8858 6.78105C30.3859 7.28115 30.6668 7.95942 30.6668 8.66667V23.3333Z"
                stroke="#E0E0E0"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.0002 20.6667C18.9457 20.6667 21.3335 18.2789 21.3335 15.3333C21.3335 12.3878 18.9457 10 16.0002 10C13.0546 10 10.6668 12.3878 10.6668 15.3333C10.6668 18.2789 13.0546 20.6667 16.0002 20.6667Z"
                stroke="#E0E0E0"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <Select
            disabled={disabled}
            value={currentVideoDeviceId || ""}
            onValueChange={(value) =>
              switchDevice({ deviceId: value, kind: "videoinput" })
            }
            onOpenChange={(open) => {
              if (open && !hasRequestedMediaDevices) setHasRequestedMediaDevices(true);
            }}
          >
            <SelectTrigger className="flex-grow max-w-[90%] ml-auto">
              <SelectValue placeholder="Select Webcam" />
            </SelectTrigger>
            <SelectContent>
              {devicesInfo
                .filter((device) => device.kind === "videoinput")
                .map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full flex gap-4 items-center">
          <label htmlFor="audioSource" className="sr-only">
            Mic
          </label>
          <span className="w-[10%] flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="32"
              viewBox="0 0 22 32"
              fill="none"
            >
              <path
                d="M20.3332 13.3334V16C20.3332 18.4754 19.3498 20.8494 17.5995 22.5997C15.8492 24.35 13.4752 25.3334 10.9998 25.3334M10.9998 25.3334C8.52448 25.3334 6.15051 24.35 4.40017 22.5997C2.64983 20.8494 1.6665 18.4754 1.6665 16V13.3334M10.9998 25.3334V30.6667M5.6665 30.6667H16.3332M10.9998 1.33337C9.93897 1.33337 8.92156 1.7548 8.17141 2.50495C7.42126 3.25509 6.99984 4.27251 6.99984 5.33337V16C6.99984 17.0609 7.42126 18.0783 8.17141 18.8285C8.92156 19.5786 9.93897 20 10.9998 20C12.0607 20 13.0781 19.5786 13.8283 18.8285C14.5784 18.0783 14.9998 17.0609 14.9998 16V5.33337C14.9998 4.27251 14.5784 3.25509 13.8283 2.50495C13.0781 1.7548 12.0607 1.33337 10.9998 1.33337Z"
                stroke="#B3B3B3"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <Select
            disabled={disabled}
            value={currentAudioDeviceId || ""}
            onValueChange={(value) =>
              switchDevice({ deviceId: value, kind: "audioinput" })
            }
            onOpenChange={(open) => {
              if (open && !hasRequestedMediaDevices) setHasRequestedMediaDevices(true);
            }}
          >
            <SelectTrigger className="flex-grow max-w-[90%] ml-auto">
              <SelectValue placeholder="Select Microphone" className="text-sm" />
            </SelectTrigger>
            <SelectContent>
              {devicesInfo
                .filter((device) => device.kind === "audioinput")
                .map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId} className="text-sm">
                    {device.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
