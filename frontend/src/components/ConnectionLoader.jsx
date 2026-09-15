function ConnectionLoader({ backendStatus }) {
  const isConnecting = backendStatus === "connecting";

  return (
    <div className="connection-loader" aria-live="polite">
      <div className="connection-loader-box">
        <div className="loader-ring" aria-hidden="true" />

        <h2>
          {isConnecting
            ? "Connecting to backend"
            : "Preparing system"}
        </h2>

        <p>
          {isConnecting
            ? "Establishing a secure connection to the interpretation service..."
            : "Please wait a moment while the system prepares."}
        </p>
      </div>
    </div>
  );
}

export default ConnectionLoader;
