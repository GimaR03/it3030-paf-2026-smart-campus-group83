import { useState, useEffect } from "react";
import {
  loginUser,
  googleLoginUser,
  registerUser,
  createAdminUser,
  fetchAdmins,
  createMaintenanceUser,
  fetchMaintenanceStaff,
  fetchAllUsers,
  deleteUserAccount,
} from "../api/campusApi";

export function useCampusAuth({ setErrorMessage, setSuccessMessage, setCurrentDashboard, clearMessages }) {
  const [authUser, setAuthUser] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [maintenanceStaff, setMaintenanceStaff] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    idNumber: "",
    affiliation: "",
    department: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    dateOfBirth: "",
  });
  const [createAdminForm, setCreateAdminForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [createMaintenanceForm, setCreateMaintenanceForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const loadAdmins = async () => {
    if (!authUser || authUser.role !== "ADMIN") return;
    try {
      const data = await fetchAdmins(authUser.email);
      setAdmins(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const loadMaintenanceStaff = async () => {
    if (!authUser || authUser.role !== "ADMIN") return;
    try {
      const data = await fetchMaintenanceStaff(authUser.email);
      setMaintenanceStaff(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const user = await loginUser({ 
        email: loginForm.email, 
        password: loginForm.password 
      });
      setAuthUser(user);
      setLoginForm({ email: "", password: "" });
      setSuccessMessage(`Welcome, ${user.fullName}!`);
      
      // Role-based redirection
      if (user.role === "ADMIN") {
        setCurrentDashboard("admin");
      } else if (user.role === "MAINTENANCE") {
        setCurrentDashboard("maintenance");
      } else {
        setCurrentDashboard("portal");
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    clearMessages();
    try {
      // Simulate Google Login with a valid campus email
      const user = await googleLoginUser({ 
        email: "student.demo@my.sliit.lk", 
        fullName: "Google Demo User" 
      });
      setAuthUser(user);
      setSuccessMessage(`Welcome, ${user.fullName}!`);
      setCurrentDashboard("portal");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    
    if (!registerForm.email.toLowerCase().endsWith("@my.sliit.lk")) {
      setErrorMessage("Only @my.sliit.lk email addresses are allowed.");
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!/^\d{10}$/.test(registerForm.phoneNumber.trim())) {
      setErrorMessage("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      await registerUser({
        fullName: registerForm.fullName,
        email: registerForm.email,
        phoneNumber: registerForm.phoneNumber,
        idNumber: registerForm.idNumber,
        affiliation: registerForm.affiliation,
        department: registerForm.department,
        password: registerForm.password,
        role: registerForm.role || "USER",
        dateOfBirth: registerForm.dateOfBirth,
      });
      setSuccessMessage("Account created. Please login.");
      setCurrentDashboard("login");
      setRegisterForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        idNumber: "",
        affiliation: "",
        department: "",
        password: "",
        confirmPassword: "",
        role: "USER",
        dateOfBirth: "",
      });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setCurrentDashboard("login");
    setSuccessMessage("Logged out successfully.");
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await createAdminUser(createAdminForm, authUser.email);
      setSuccessMessage(`Admin account for ${createAdminForm.email} created.`);
      setCreateAdminForm({ fullName: "", email: "", password: "" });
      loadAdmins();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!authUser || authUser.role !== "ADMIN") {
      setErrorMessage("Admin access is required");
      return;
    }

    try {
      await createMaintenanceUser(createMaintenanceForm, authUser.email);
      setSuccessMessage(`Maintenance account for ${createMaintenanceForm.email} created.`);
      setCreateMaintenanceForm({ fullName: "", email: "", password: "" });
      loadMaintenanceStaff();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const loadAllUsers = async () => {
    if (!authUser || authUser.role !== "ADMIN") return;
    try {
      const data = await fetchAllUsers(authUser.email);
      setAllUsers(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!authUser || authUser.role !== "ADMIN") return;
    if (!window.confirm("Are you sure you want to delete this user account? This action cannot be undone.")) return;

    try {
      await deleteUserAccount(userId, authUser.email);
      setSuccessMessage("User account deleted successfully.");
      loadAllUsers();
      // Also reload other lists in case they were in them
      loadAdmins();
      loadMaintenanceStaff();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return {
    authUser,
    setAuthUser,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    createAdminForm,
    setCreateAdminForm,
    handleLoginSubmit,
    handleGoogleLogin,
    handleRegisterSubmit,
    handleLogout,
    handleCreateAdmin,
    admins,
    loadAdmins,
    maintenanceStaff,
    loadMaintenanceStaff,
    createMaintenanceForm,
    setCreateMaintenanceForm,
    handleCreateMaintenance,
    allUsers,
    loadAllUsers,
    handleDeleteUser,
  };
}
