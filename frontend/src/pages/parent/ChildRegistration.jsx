import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChildrenAPI } from "../../api/http";
import "../../styles/parent/child-registration.css";

export default function ChildRegistration() {
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    pin: "",
    confirmPin: "",
    theme: "sunrise"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated as parent
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.token || user.role !== "parent") {
      setError("You need to be logged in as a parent to manage children");
      return;
    }
    
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const childrenData = await ChildrenAPI.mine();
      setChildren(childrenData);
    } catch (err) {
      setError("Failed to load children");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Child name is required");
      return false;
    }
    if (!form.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (form.username.length < 3 || form.username.length > 32) {
      setError("Username must be 3-32 characters");
      return false;
    }
    if (!/^[a-z0-9_.-]+$/i.test(form.username)) {
      setError("Username can only contain letters, numbers, dots, dashes, and underscores");
      return false;
    }
    if (!form.pin.trim()) {
      setError("PIN is required");
      return false;
    }
    if (!/^\d{4,6}$/.test(form.pin)) {
      setError("PIN must be 4-6 digits");
      return false;
    }
    if (form.pin !== form.confirmPin) {
      setError("PIN confirmation doesn't match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await ChildrenAPI.create({
        name: form.name.trim(),
        username: form.username.trim(),
        pin: form.pin,
        theme: form.theme
      });

      setForm({
        name: "",
        username: "",
        pin: "",
        confirmPin: "",
        theme: "sunrise"
      });
      setShowForm(false);
      setSuccessMessage("Child account created successfully! You can add more children using the '+ Add Child' button above.");
      await loadChildren();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err.message || "Failed to create child account");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (childId) => {
    const username = prompt("Enter username for child:");
    const pin = prompt("Enter 4-6 digit PIN:");
    
    if (!username || !pin) return;

    // Validate inputs
    if (username.length < 3 || username.length > 32) {
      alert("Username must be 3-32 characters long");
      return;
    }
    if (!/^[a-z0-9_.-]+$/i.test(username)) {
      alert("Username can only contain letters, numbers, dots, dashes, and underscores");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      alert("PIN must be 4-6 digits");
      return;
    }

    try {
      // Check if user is authenticated
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user || !user.token) {
        alert("You need to be logged in as a parent to create child accounts");
        return;
      }

      console.log("Creating account for child:", childId, "with data:", { username, pin: "***" });
      await ChildrenAPI.createAccount(childId, { username, pin });
      await loadChildren();
      alert("Child account created successfully!");
    } catch (err) {
      console.error("Account creation error:", err);
      let errorMessage = "Failed to create account";
      
      if (err.message.includes("404")) {
        errorMessage = "Service not found. Please make sure you're logged in as a parent.";
      } else if (err.message.includes("401")) {
        errorMessage = "Authentication required. Please log in as a parent first.";
      } else if (err.message.includes("403")) {
        errorMessage = "Permission denied. Only parents can create child accounts.";
      } else if (err.message.includes("409")) {
        errorMessage = "Username already taken. Please choose a different username.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  const deleteChild = async (childId, childName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${childName}?\n\nThis action cannot be undone and will also delete their login account if it exists.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      console.log("Deleting child:", childId);
      await ChildrenAPI.delete(childId);
      setSuccessMessage(`${childName} has been deleted successfully.`);
      setTimeout(() => setSuccessMessage(""), 5000);
      await loadChildren(); // Refresh the list
    } catch (err) {
      console.error("Delete child error:", err);
      let errorMessage = "Failed to delete child";
      
      if (err.message.includes("404")) {
        errorMessage = "Child not found or you don't have permission to delete this child.";
      } else if (err.message.includes("403")) {
        errorMessage = "Access denied. Please make sure you're logged in as a parent.";
      }
      
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const themes = [
    { value: "sunrise", label: "🌅 Sunrise", color: "#ff9a9e" },
    { value: "ocean", label: "🌊 Ocean", color: "#a8edea" },
    { value: "forest", label: "🌳 Forest", color: "#d299c2" },
    { value: "space", label: "🚀 Space", color: "#89f7fe" },
    { value: "rainbow", label: "🌈 Rainbow", color: "#ffecd2" }
  ];

  return (
    <div className="child-registration-container">
      <div className="header">
        <h1>Manage Children</h1>
        <button 
          className="add-child-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Child"}
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      {showForm && (
        <div className="registration-form-container">
          <form onSubmit={handleSubmit} className="child-form">
            <h2>Register New Child</h2>
            
            <div className="form-group">
              <label htmlFor="name">Child's Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Enter child's name"
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                placeholder="Choose a username (3-32 characters)"
                maxLength="32"
              />
              <small>Letters, numbers, dots, dashes, and underscores only</small>
            </div>

            <div className="form-group">
              <label htmlFor="pin">PIN *</label>
              <input
                type="password"
                id="pin"
                name="pin"
                value={form.pin}
                onChange={handleInputChange}
                placeholder="Enter 4-6 digit PIN"
                maxLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPin">Confirm PIN *</label>
              <input
                type="password"
                id="confirmPin"
                name="confirmPin"
                value={form.confirmPin}
                onChange={handleInputChange}
                placeholder="Confirm PIN"
                maxLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <div className="theme-selector">
                {themes.map(theme => (
                  <label key={theme.value} className="theme-option">
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={form.theme === theme.value}
                      onChange={handleInputChange}
                    />
                    <div 
                      className="theme-preview"
                      style={{ background: theme.color }}
                    >
                      {theme.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Creating..." : "Create Child Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="children-list">
        <h2>Registered Children</h2>
        {children.length === 0 ? (
          <div className="no-children">
            <p>No children registered yet. Add your first child above!</p>
          </div>
        ) : (
          <div className="children-grid">
            {children.map((child) => (
              <div key={child._id} className="child-card">
                <div className="child-info">
                  <h3>{child.name}</h3>
                  <div className="child-details">
                    {child.account ? (
                      <>
                        <p><strong>Username:</strong> {child.account.username}</p>
                        <p><strong>Theme:</strong> {child.account.theme}</p>
                        {child.account.lastLoginAt && (
                          <p><strong>Last Login:</strong> {new Date(child.account.lastLoginAt).toLocaleDateString()}</p>
                        )}
                        <div className="account-status success">✅ Account Active</div>
                      </>
                    ) : (
                      <>
                        <div className="account-status pending">⚠️ No Account</div>
                        <button 
                          className="create-account-btn"
                          onClick={() => createAccount(child._id)}
                        >
                          Create Login Account
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="child-actions">
                  <button 
                    className="view-routines-btn"
                    onClick={() => navigate(`/parent/child/${child._id}/routines`)}
                  >
                    View Routines
                  </button>
                  <button 
                    className="delete-child-btn"
                    onClick={() => deleteChild(child._id, child.name)}
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="navigation">
        <button onClick={() => navigate("/routines")}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
