import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../../services/api";
import { Users, Search, RefreshCw, Trophy, UserCheck, Package } from "lucide-react";

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSport, setSelectedSport] = useState("all");

    const token = localStorage.getItem("token");

    const loadTeams = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get(`${API_BASE}/admin/teams`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTeams(res.data.teams || []);
        } catch (err) {
            console.error("Failed to load teams:", err);
            setError(err.response?.data?.message || "Failed to load teams list.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeams();
    }, []);

    // Filter teams
    const filteredTeams = teams.filter((t) => {
        const matchesSearch =
            (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.teamId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.sport || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.coachId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.coachId?.userId || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSport =
            selectedSport === "all" ||
            (t.sport || "").toLowerCase() === selectedSport.toLowerCase();

        return matchesSearch && matchesSport;
    });

    const sportsList = Array.from(new Set(teams.map((t) => t.sport).filter(Boolean)));
    const totalAllocatedGear = teams.reduce((acc, t) => {
        const teamTotal = (t.equipments || []).reduce((sub, eq) => sub + (eq.quantity || 0), 0);
        return acc + teamTotal;
    }, 0);

    return (
        <div className="management-page">
            {/* Page Header */}
            <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0, fontSize: "22px" }}>
                        <Users size={24} color="#05c7ee" />
                        Team & Squad Management
                    </h1>
                    <p style={{ margin: "4px 0 0 0", color: "#8da3b5", fontSize: "13px" }}>
                        View, monitor, and manage collegiate sports teams, squads, assigned coaches, athlete rosters, and allocated equipment.
                    </p>
                </div>
            </div>

            {/* Quick Metrics */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                    margin: "16px 0"
                }}
            >
                <div
                    style={{
                        backgroundColor: "#1b2027",
                        border: "1px solid #2b323a",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>TOTAL TEAMS</span>
                        <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{teams.length}</h2>
                    </div>
                    <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(5, 199, 238, 0.1)", color: "#05c7ee" }}>
                        <Users size={24} />
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: "#1b2027",
                        border: "1px solid #2b323a",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>SPORTS DISCIPLINES</span>
                        <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>{sportsList.length || 1}</h2>
                    </div>
                    <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
                        <Trophy size={24} />
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: "#1b2027",
                        border: "1px solid #2b323a",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>TOTAL SQUAD ATHLETES</span>
                        <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#f0f6fc" }}>
                            {teams.reduce((acc, t) => acc + (t.students?.length || 0), 0)}
                        </h2>
                    </div>
                    <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <UserCheck size={24} />
                    </div>
                </div>

                <div
                    style={{
                        backgroundColor: "#1b2027",
                        border: "1px solid #2b323a",
                        borderRadius: "8px",
                        padding: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#8da3b5" }}>ALLOCATED GEAR UNITS</span>
                        <h2 style={{ margin: "4px 0 0 0", fontSize: "24px", color: "#38bdf8" }}>
                            {totalAllocatedGear}
                        </h2>
                    </div>
                    <div style={{ padding: "10px", borderRadius: "8px", backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8" }}>
                        <Package size={24} />
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div
                className="management-card"
                style={{
                    padding: "14px 18px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
                    <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
                        <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e7681" }} />
                        <input
                            type="text"
                            placeholder="Search by team name, ID, coach, sport..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "8px 12px 8px 34px",
                                backgroundColor: "#0d1117",
                                border: "1px solid #30363d",
                                borderRadius: "6px",
                                color: "#f0f6fc",
                                fontSize: "13px",
                                outline: "none",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <select
                        value={selectedSport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            backgroundColor: "#0d1117",
                            border: "1px solid #30363d",
                            borderRadius: "6px",
                            color: "#f0f6fc",
                            fontSize: "13px",
                            outline: "none",
                            cursor: "pointer"
                        }}
                    >
                        <option value="all">All Sports ({teams.length})</option>
                        {sportsList.map((sp) => (
                            <option key={sp} value={sp}>
                                {sp}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={loadTeams}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: "#21262d",
                        border: "1px solid #30363d",
                        borderRadius: "6px",
                        color: "#c9d1d9",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                    title="Refresh teams list"
                >
                    <RefreshCw size={14} className={loading ? "spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Teams Table Card */}
            <div className="management-card" style={{ padding: "0", overflow: "hidden" }}>
                <div
                    style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid #2b323a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "16px", color: "#f0f6fc" }}>
                        Registered Sports Squads ({filteredTeams.length})
                    </h2>
                </div>

                <div className="management-card-body" style={{ padding: "0" }}>
                    {loading ? (
                        <div className="empty-state" style={{ padding: "40px" }}>
                            <div className="dashboard-loading">Loading teams and squads...</div>
                        </div>
                    ) : error ? (
                        <div className="empty-state" style={{ padding: "40px" }}>
                            <h3 style={{ color: "#f87171" }}>Unable to load teams</h3>
                            <p>{error}</p>
                            <button className="primary-btn" onClick={loadTeams} style={{ marginTop: "12px" }}>
                                Try Again
                            </button>
                        </div>
                    ) : filteredTeams.length === 0 ? (
                        <div className="empty-state" style={{ padding: "50px 20px", textAlign: "center" }}>
                            <Users size={48} style={{ opacity: 0.3, marginBottom: "12px" }} />
                            <h3>No Teams Found</h3>
                            <p style={{ color: "#8da3b5", maxWidth: "400px", margin: "0 auto 16px auto" }}>
                                {searchQuery || selectedSport !== "all"
                                    ? "No teams match your search or filter criteria."
                                    : "Teams will appear here once coaches are registered with their custom team names."}
                            </p>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper" style={{ overflowX: "auto" }}>
                            <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#14181e", textAlign: "left" }}>
                                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>TEAM / SQUAD NAME</th>
                                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>TEAM ID</th>
                                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>SPORT</th>
                                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>ASSIGNED COACH</th>
                                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>ROSTER COUNT</th>
                                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>ALLOCATED EQUIPMENT</th>
                                        <th style={{ padding: "12px 16px", fontSize: "11px", color: "#8da3b5", borderBottom: "1px solid #2b323a" }}>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTeams.map((team) => {
                                        const teamEquipments = team.equipments || [];
                                        const totalEquipQty = teamEquipments.reduce((acc, eq) => acc + (eq.quantity || 0), 0);

                                        return (
                                            <tr
                                                key={team._id || team.teamId}
                                                style={{
                                                    borderBottom: "1px solid #21262d",
                                                    transition: "background-color 0.15s"
                                                }}
                                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#161b22")}
                                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                            >
                                                {/* Team Name */}
                                                <td style={{ padding: "14px 16px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <div
                                                            style={{
                                                                width: "36px",
                                                                height: "36px",
                                                                borderRadius: "8px",
                                                                backgroundColor: "rgba(5, 199, 238, 0.15)",
                                                                color: "#05c7ee",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: "700",
                                                                fontSize: "16px"
                                                            }}
                                                        >
                                                            🏆
                                                        </div>
                                                        <div>
                                                            <strong style={{ color: "#f0f6fc", fontSize: "14px", display: "block" }}>
                                                                {team.name}
                                                            </strong>
                                                            <span style={{ fontSize: "11px", color: "#8b949e" }}>
                                                                Varsity Squad
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Team ID */}
                                                <td style={{ padding: "14px 16px" }}>
                                                    <span
                                                        style={{
                                                            padding: "4px 8px",
                                                            backgroundColor: "rgba(56, 189, 248, 0.1)",
                                                            border: "1px solid rgba(56, 189, 248, 0.25)",
                                                            borderRadius: "4px",
                                                            color: "#38bdf8",
                                                            fontFamily: "monospace",
                                                            fontWeight: "700",
                                                            fontSize: "12px"
                                                        }}
                                                    >
                                                        {team.teamId}
                                                    </span>
                                                </td>

                                                {/* Sport */}
                                                <td style={{ padding: "14px 16px" }}>
                                                    <span
                                                        style={{
                                                            padding: "4px 10px",
                                                            backgroundColor: "rgba(234, 179, 8, 0.15)",
                                                            border: "1px solid rgba(234, 179, 8, 0.3)",
                                                            borderRadius: "4px",
                                                            color: "#facc15",
                                                            fontSize: "12px",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        {team.sport}
                                                    </span>
                                                </td>

                                                {/* Assigned Coach */}
                                                <td style={{ padding: "14px 16px" }}>
                                                    {team.coachId ? (
                                                        <div>
                                                            <strong style={{ color: "#f0f6fc", fontSize: "13px", display: "block" }}>
                                                                {team.coachId.name}
                                                            </strong>
                                                            <span style={{ fontSize: "11px", color: "#05c7ee" }}>
                                                                Coach ID: {team.coachId.userId}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: "#8da3b5", fontSize: "12px" }}>Unassigned</span>
                                                    )}
                                                </td>

                                                {/* Roster Count */}
                                                <td style={{ padding: "14px 16px" }}>
                                                    <span
                                                        style={{
                                                            padding: "3px 10px",
                                                            borderRadius: "12px",
                                                            backgroundColor: "rgba(34, 197, 94, 0.15)",
                                                            color: "#4ade80",
                                                            fontSize: "12px",
                                                            fontWeight: "700"
                                                        }}
                                                    >
                                                        {team.students?.length || 0} Athletes
                                                    </span>
                                                </td>

                                                {/* Allocated Equipment */}
                                                <td style={{ padding: "14px 16px" }}>
                                                    {teamEquipments.length === 0 ? (
                                                        <span style={{ color: "#6e7681", fontSize: "12px" }}>No gear allocated</span>
                                                    ) : (
                                                        <div>
                                                            <span
                                                                style={{
                                                                    padding: "3px 8px",
                                                                    borderRadius: "10px",
                                                                    backgroundColor: "rgba(5, 199, 238, 0.15)",
                                                                    color: "#05c7ee",
                                                                    fontSize: "12px",
                                                                    fontWeight: "700",
                                                                    display: "inline-block",
                                                                    marginBottom: "4px"
                                                                }}
                                                            >
                                                                {totalEquipQty} Units ({teamEquipments.length} Types)
                                                            </span>
                                                            <div style={{ fontSize: "11px", color: "#8da3b5" }}>
                                                                {teamEquipments.slice(0, 2).map((eq) => `${eq.name || eq.equipmentId?.name} (${eq.quantity})`).join(", ")}
                                                                {teamEquipments.length > 2 ? ` +${teamEquipments.length - 2} more` : ""}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td style={{ padding: "14px 16px" }}>
                                                    <span className="status-badge success">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Teams;