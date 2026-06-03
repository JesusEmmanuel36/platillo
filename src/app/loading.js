export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="loader"></div>

      <style>{`
        .loader {
          width: 40px;
          height: 40px;
          border: 4px solid #ddd;
          border-top: 4px solid var(--accent-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}