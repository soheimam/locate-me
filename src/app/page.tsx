"use client";

import { useState, useEffect, useCallback } from "react";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}

export default function Home() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });
  const [destination, setDestination] = useState("");

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    <div className="relative flex h-screen w-full flex-col bg-zinc-200 dark:bg-zinc-900">
      {/* Map Area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Stylized Map Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
          {/* Grid lines to simulate map */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute h-px w-full bg-zinc-400 dark:bg-zinc-600"
                style={{ top: `${i * 5}%` }}
              />
            ))}
            {[...Array(20)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-px bg-zinc-400 dark:bg-zinc-600"
                style={{ left: `${i * 5}%` }}
              />
            ))}
          </div>

          {/* Simulated roads */}
          <div className="absolute left-1/4 top-0 h-full w-3 bg-zinc-300 dark:bg-zinc-700" />
          <div className="absolute left-1/2 top-0 h-full w-4 bg-zinc-300 dark:bg-zinc-700" />
          <div className="absolute right-1/4 top-0 h-full w-2 bg-zinc-300 dark:bg-zinc-700" />
          <div className="absolute left-0 top-1/3 h-3 w-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="absolute left-0 top-2/3 h-4 w-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Current Location Marker */}
        {!location.loading && !location.error && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {/* Pulse ring */}
            <div className="absolute -inset-4 animate-ping rounded-full bg-blue-500 opacity-20" />
            <div className="absolute -inset-8 rounded-full bg-blue-500 opacity-10" />
            {/* Center dot */}
            <div className="relative h-5 w-5 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
          </div>
        )}

        {/* Loading overlay */}
        {location.loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-800">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-500" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Finding your location...
              </p>
            </div>
          </div>
        )}

        {/* Recenter button */}
        <button
          onClick={getLocation}
          className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform active:scale-95 dark:bg-zinc-800"
        >
          <svg
            className="h-6 w-6 text-zinc-700 dark:text-zinc-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
          </svg>
        </button>
      </div>

      {/* Bottom Sheet */}
      <div className="relative rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-800">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>

        <div className="px-5 pb-8">
          {/* Search Bar */}
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-zinc-100 px-4 py-3 dark:bg-zinc-700">
            <svg
              className="h-5 w-5 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 bg-transparent text-lg font-medium text-zinc-900 placeholder-zinc-500 outline-none dark:text-white dark:placeholder-zinc-400"
            />
          </div>

          {/* Location Info */}
          {location.error ? (
            <div className="mb-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-center text-sm text-red-600 dark:text-red-400">
                {location.error}
              </p>
              <button
                onClick={getLocation}
                className="mt-3 w-full rounded-lg bg-red-500 py-2 text-sm font-medium text-white"
              >
                Enable Location
              </button>
            </div>
          ) : (
            <div className="mb-5 flex items-start gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <div className="h-8 w-0.5 bg-zinc-300 dark:bg-zinc-600" />
                <div className="h-3 w-3 rounded-sm bg-zinc-900 dark:bg-white" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Current location
                  </p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {location.latitude && location.longitude
                      ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                      : "Locating..."}
                  </p>
                </div>
                <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Destination
                  </p>
                  <p className="font-medium text-zinc-400 dark:text-zinc-500">
                    {destination || "Enter destination"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ride Options */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <button className="flex flex-col items-center gap-2 rounded-xl bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 dark:bg-white">
                <svg className="h-6 w-6 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Ride</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-xl bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-600">
                <svg className="h-6 w-6 text-zinc-700 dark:text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z"/>
                  <path d="M5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Bike</span>
            </button>
            <button className="flex flex-col items-center gap-2 rounded-xl bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-600">
                <svg className="h-6 w-6 text-zinc-700 dark:text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm2 0V6h5v5h-5zm3.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Transit</span>
            </button>
          </div>

          {/* Confirm Button */}
          <button
            disabled={!location.latitude || !destination}
            className="w-full rounded-xl bg-zinc-900 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
          >
            Confirm Pickup
          </button>
        </div>
      </div>
    </div>
  );
}
