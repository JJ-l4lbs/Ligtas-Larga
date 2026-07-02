"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HazardReport {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  severity: string;
  description: string;
  imageUrl?: string | null;
  isValidated: boolean;
  reportedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED">("ALL");
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSessionAndReports = async () => {
    try {
      // 1. Verify user session
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      
      if (!meData.user || meData.user.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      setAdminEmail(meData.user.email);

      // 2. Fetch reports
      const reportsRes = await fetch("/api/admin/reports");
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndReports();
  }, [router]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isValidated: true }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isValidated: true } : r))
        );
      }
    } catch (err) {
      console.error("Failed to verify report:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartEdit = (report: HazardReport) => {
    setEditingId(report.id);
    setEditDescription(report.description);
  };

  const handleSaveEdit = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, description: editDescription }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, description: editDescription } : r))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Failed to save edited description:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hazard report?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reports?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === "PENDING") return !r.isValidated;
    if (filter === "VERIFIED") return r.isValidated;
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-on-app-left)" }}>Verifying Admin Credentials...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", paddingBottom: "40px" }}>
      {/* Admin Navbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1.5px solid var(--border-subtle)",
          backgroundColor: "var(--bg-card)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>🛠️</span>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "16px", color: "var(--text-primary)" }}>Admin Panel</h1>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Logged in as: {adminEmail}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/"
            className="btn-interactive"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1.5px solid var(--border-subtle)",
              backgroundColor: "var(--bg-app-left)",
              color: "var(--text-on-app-left)",
              fontWeight: 700,
              fontSize: "12px",
              textDecoration: "none",
            }}
          >
            🗺️ View Map
          </Link>
          <button
            onClick={handleLogout}
            className="btn-interactive"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#9F1239",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "24px auto", padding: "0 16px" }}>
        {/* Title and stats */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-on-app-left)" }}>Hazard Reports Queue</h2>
            <p style={{ fontSize: "13px", color: "var(--text-on-app-left-secondary)" }}>
              Manage crowdsourced navigation obstacle reports
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", fontSize: "12px", fontWeight: 700, color: "var(--text-on-app-left-secondary)" }}>
            <span>Total: {reports.length}</span>
            <span>•</span>
            <span style={{ color: "var(--severity-high)" }}>Pending: {reports.filter((r) => !r.isValidated).length}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            padding: "4px",
            borderRadius: "10px",
          }}
        >
          {(["ALL", "PENDING", "VERIFIED"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                backgroundColor: filter === mode ? "var(--bg-card)" : "transparent",
                color: filter === mode ? "var(--text-primary)" : "var(--text-on-app-left-secondary)",
                boxShadow: filter === mode ? "var(--shadow-glass)" : "none",
                transition: "all 0.2s",
              }}
            >
              {mode === "ALL" && "All Reports"}
              {mode === "PENDING" && "Pending Review"}
              {mode === "VERIFIED" && "Verified"}
            </button>
          ))}
        </div>

        {/* Report list */}
        {filteredReports.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: "40px 20px",
              textAlign: "center",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
            }}
          >
            <span style={{ fontSize: "32px" }}>🎉</span>
            <h3 style={{ marginTop: "12px", fontSize: "16px", fontWeight: 700 }}>No reports found</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
              All reports in this filter category have been resolved or cleared.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredReports.map((report) => {
              let categoryEmoji = "⚠️";
              if (report.category === "FLOOD") categoryEmoji = "🌧️";
              else if (report.category === "ELEVATOR_BROKEN") categoryEmoji = "🛗";
              else if (report.category === "RAMP_BLOCKED") categoryEmoji = "♿";
              else if (report.category === "OBSTACLE") categoryEmoji = "🚧";

              let sevColor = "#10b981";
              if (report.severity === "MEDIUM") sevColor = "#f59e0b";
              if (report.severity === "HIGH") sevColor = "#ef4444";

              return (
                <div
                  key={report.id}
                  className="glass-panel"
                  style={{
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>{categoryEmoji}</span>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: "14px" }}>
                          {report.category.replace(/_/g, " ")}
                        </h4>
                        <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                          Reported At: {new Date(report.reportedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: `${sevColor}20`,
                          color: sevColor,
                        }}
                      >
                        {report.severity}
                      </span>

                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "4px",
                          backgroundColor: report.isValidated ? "#DCFCE7" : "#FFE4E6",
                          color: report.isValidated ? "#15803D" : "#9F1239",
                        }}
                      >
                        {report.isValidated ? "Verified" : "Pending Review"}
                      </span>
                    </div>
                  </div>

                  {/* Body & Image */}
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    {report.imageUrl && (
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1.5px solid var(--border-subtle)",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={report.imageUrl}
                          alt="Verification visual"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      {editingId === report.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            style={{
                              width: "100%",
                              height: "70px",
                              padding: "8px",
                              borderRadius: "6px",
                              border: "1.5px solid var(--border-subtle)",
                              fontSize: "13px",
                              resize: "none",
                              outline: "none",
                              color: "var(--text-input-typed)",
                              backgroundColor: "var(--bg-input-light)",
                            }}
                          />
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              onClick={() => handleSaveEdit(report.id)}
                              disabled={actionLoading === report.id}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "4px",
                                border: "none",
                                backgroundColor: "var(--text-primary)",
                                color: "#FFFFFF",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "4px",
                                border: "1.5px solid var(--border-subtle)",
                                backgroundColor: "transparent",
                                color: "var(--text-secondary)",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                            {report.description}
                          </p>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                            📍 Coord: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "12px",
                    }}
                  >
                    <div>
                      {!report.isValidated && (
                        <button
                          onClick={() => handleVerify(report.id)}
                          disabled={actionLoading === report.id}
                          className="btn-interactive"
                          style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#16A34A",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          {actionLoading === report.id ? "Approving..." : "✓ Approve & Verify"}
                        </button>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      {editingId !== report.id && (
                        <button
                          onClick={() => handleStartEdit(report)}
                          className="btn-interactive"
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1.5px solid var(--border-subtle)",
                            backgroundColor: "transparent",
                            color: "var(--text-secondary)",
                            fontWeight: 600,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          ✏️ Edit Description
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={actionLoading === report.id}
                        className="btn-interactive"
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#E11D48",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Delete / Archive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
