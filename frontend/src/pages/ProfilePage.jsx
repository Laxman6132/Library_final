import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "../services/api";
import { User, Mail, Phone, MapPin, Shield, Edit2, Check, X } from "lucide-react";

export default function ProfilePage() {
  const { userProfile, auth, profileError, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    emailId: "",
    phNo: "",
    address: "",
    gender: "MALE"
  });
  const [loading, setLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    if (userProfile) {
      setFormData({
        userName: userProfile.userName || "",
        emailId: userProfile.emailId || "",
        phNo: userProfile.phNo || "",
        address: userProfile.address || "",
        gender: userProfile.gender || "MALE"
      });
    }
  }, [userProfile]);
  
  if (profileError) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="alert alert-danger d-inline-block shadow-sm">
          <strong>Oops!</strong> {profileError}. Please try logging out and logging back in.
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container py-5 text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUpdateError("");
    try {
      // API expects UserDTO format
      const payload = {
        ...userProfile,
        userName: formData.userName,
        emailId: formData.emailId,
        phNo: parseInt(formData.phNo) || 0,
        address: formData.address,
        gender: formData.gender
      };
      
      await updateUser(userProfile.userId, payload);
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setUpdateError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle absolute URL for QR code considering Vite proxy vs production
  const qrUrl = userProfile.qrCode
    ? userProfile.qrCode.startsWith("http")
      ? userProfile.qrCode
      : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}${userProfile.qrCode}`
    : null;

  return (
    <div className="container py-5" style={{ maxWidth: "800px", marginTop: "80px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">My Profile</h2>
        {!isEditing ? (
          <button 
            className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={16} className="me-2" />
            Edit Profile
          </button>
        ) : (
          <button 
            className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center"
            onClick={() => setIsEditing(false)}
          >
            <X size={16} className="me-2" />
            Cancel
          </button>
        )}
      </div>

      {updateError && (
        <div className="alert alert-danger shadow-sm rounded-3 mb-4">
          {updateError}
        </div>
      )}
      
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Profile Header Gradient */}
        <div 
          style={{ 
            height: "120px", 
            background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)" 
          }} 
        />
        
        <div className="card-body px-4 pb-5 position-relative">
          {/* Avatar Profile */}
          <div 
            className="bg-white p-2 rounded-circle shadow-sm d-inline-block position-relative"
            style={{ marginTop: "-60px", marginBottom: "20px" }}
          >
            <div 
              className="bg-light rounded-circle d-flex align-items-center justify-content-center text-primary"
              style={{ width: "100px", height: "100px", fontSize: "40px" }}
            >
              <User size={50} />
            </div>
          </div>
          
          <div className="row g-4">
            <div className="col-md-8">
              {isEditing ? (
                // Edit Form
                <form onSubmit={handleUpdate} className="bg-light rounded-4 p-4 border border-white shadow-sm">
                  <h5 className="fw-bold mb-4" style={{ fontSize: "1.1rem" }}>Edit Information</h5>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">User Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="userName" 
                      value={formData.userName} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="emailId" 
                      value={formData.emailId} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Phone Number</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="phNo" 
                      value={formData.phNo} 
                      onChange={handleChange} 
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Address</label>
                    <textarea 
                      className="form-control" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      rows="2"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">Gender</label>
                    <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-semibold shadow-sm" disabled={loading}>
                    {loading ? "Saving Changes..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                // Read Only View
                <>
                  <h3 className="fw-bold mb-1">{userProfile.userName}</h3>
                  <p className="text-muted d-flex align-items-center mb-4">
                    <Shield size={16} className="me-2 text-primary" />
                    <span className="text-uppercase fw-semibold" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>
                      {userProfile.role}
                    </span>
                  </p>

                  <div className="bg-light rounded-4 p-4 border border-white shadow-sm">
                    <h5 className="fw-bold mb-4" style={{ fontSize: "1.1rem" }}>Contact Information</h5>
                    <div className="mb-3 d-flex align-items-start">
                      <div className="bg-white p-2 rounded shadow-sm text-primary me-3">
                        <Mail size={20} />
                      </div>
                      <div>
                        <div className="text-muted small fw-semibold">Email Address</div>
                        <div className="fw-medium">{userProfile.emailId}</div>
                      </div>
                    </div>
                    
                    <div className="mb-3 d-flex align-items-start">
                      <div className="bg-white p-2 rounded shadow-sm text-success me-3">
                        <Phone size={20} />
                      </div>
                      <div>
                        <div className="text-muted small fw-semibold">Phone Number</div>
                        <div className="fw-medium">{userProfile.phNo || "Not provided"}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-start">
                      <div className="bg-white p-2 rounded shadow-sm text-danger me-3">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div className="text-muted small fw-semibold">Address</div>
                        <div className="fw-medium">{userProfile.address || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="col-md-4">
              <div className="bg-light rounded-4 p-4 border border-white shadow-sm h-100 d-flex flex-column align-items-center justify-content-center text-center">
                <h5 className="fw-bold mb-3" style={{ fontSize: "1.1rem" }}>Member ID</h5>
                {qrUrl ? (
                  <div className="bg-white p-3 rounded-4 shadow-sm mb-3">
                    <img 
                      src={qrUrl} 
                      alt="User QR Code" 
                      className="img-fluid"
                      style={{ maxWidth: "160px" }}
                    />
                  </div>
                ) : (
                  <div className="text-muted small mb-3">No QR code available</div>
                )}
                <span className="badge bg-primary px-3 py-2 rounded-pill">
                  UID: {userProfile.userId}
                </span>
                
                {userProfile.fine > 0 && (
                  <div className="mt-4 p-3 bg-danger bg-opacity-10 rounded-3 text-danger fw-semibold border border-danger border-opacity-25 w-100">
                    Outstanding Fine: ₹{userProfile.fine}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
