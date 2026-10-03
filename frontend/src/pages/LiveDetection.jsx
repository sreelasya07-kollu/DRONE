import { useRef, useState } from "react";
import {
  Camera,
  Upload,
  ScanLine,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

import { uploadDetection } from "../services/api";

export default function LiveDetection() {
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResults([]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Select an image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await uploadDetection(file);

      setResults(response.data.detections || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        "Detection request failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="page-header">
        <div>
          <div className="eyebrow">
            AI / COMPUTER VISION
          </div>

          <h1>Live Detection</h1>

          <p>
            YOLO-powered object detection for
            emergency scene intelligence.
          </p>
        </div>

        <div className="emergency-state">
          <span></span>
          DETECTION ENGINE READY
        </div>
      </div>

      <div className="detection-grid">

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Scene Input</h2>
              <span>UPLOAD FIELD IMAGE</span>
            </div>

            <Camera size={20} />
          </div>

          <div
            className="upload-zone"
            onClick={() => fileRef.current?.click()}
          >

            {preview ? (
              <img
                src={preview}
                alt="Detection preview"
                className="detection-preview"
              />
            ) : (
              <>
                <Upload size={34} />

                <strong>
                  Upload emergency scene
                </strong>

                <span>
                  JPG, PNG or JPEG
                </span>
              </>
            )}

          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              handleFile(e.target.files[0])
            }
          />

          <button
            className="primary-button full"
            onClick={handleUpload}
            disabled={loading}
          >
            <ScanLine size={18} />

            {loading
              ? "RUNNING DETECTION..."
              : "RUN YOLO DETECTION"}
          </button>

          {error && (
            <div className="error-box">
              <AlertTriangle size={17} />
              {error}
            </div>
          )}

        </div>

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Detection Results</h2>
              <span>AI ANALYSIS</span>
            </div>

            <ScanLine size={20} />
          </div>

          {results.length === 0 ? (
            <div className="empty-state large">
              <ScanLine size={38} />

              <strong>
                No detections yet
              </strong>

              <span>
                Upload an image and run the AI
                detection pipeline.
              </span>
            </div>
          ) : (
            <div className="detection-results">

              {results.map((item, index) => (
                <div
                  className="detection-result"
                  key={index}
                >
                  <div className="detection-result-icon">
                    {item.name === "person"
                      ? <CheckCircle2 size={18} />
                      : <AlertTriangle size={18} />}
                  </div>

                  <div className="detection-result-info">
                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      Confidence
                    </span>
                  </div>

                  <div className="confidence">
                    {(
                      Number(item.confidence) * 100
                    ).toFixed(1)}%
                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>

      <div className="info-strip">

        <div>
          <strong>MODEL</strong>
          <span>YOLOv8</span>
        </div>

        <div>
          <strong>MODE</strong>
          <span>EMERGENCY SCENE</span>
        </div>

        <div>
          <strong>PIPELINE</strong>
          <span>IMAGE → DETECT → PRIORITIZE</span>
        </div>

      </div>

    </div>
  );
}