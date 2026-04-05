import { useState, useEffect } from "react";
import StudentProfile from "../components/StudentProfile";
import CourseRegistrations from "../components/CourseRegistrations";
import Courses from "../components/Courses";
import FeeStatus from "../components/FeeStatus";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    console.log("Dashboard - Loading userId from localStorage:", storedUserId);
    if (!storedUserId) {
      console.log("No userId found, redirecting to login");
      window.location.href = "/";
    } else {
      setUserId(storedUserId);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">EIMS - Student Dashboard</span>
          <div className="d-flex">
            <span className="text-white me-3">Welcome, {userId}</span>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-md-3">
            <div className="card shadow">
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "profile" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <i className="fas fa-user me-2"></i> Student Profile
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "registrations" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("registrations")}
                  >
                    <i className="fas fa-clipboard me-2"></i> Course Registrations
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "courses" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("courses")}
                  >
                    <i className="fas fa-book me-2"></i> My Courses
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "fees" ? "active bg-primary text-white" : ""
                    }`}
                    onClick={() => setActiveTab("fees")}
                  >
                    <i className="fas fa-receipt me-2"></i> Fee Status & Payments
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            {activeTab === "profile" && <StudentProfile userId={userId} />}
            {activeTab === "registrations" && <CourseRegistrations userId={userId} />}
            {activeTab === "courses" && <Courses userId={userId} />}
            {activeTab === "fees" && <FeeStatus userId={userId} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
