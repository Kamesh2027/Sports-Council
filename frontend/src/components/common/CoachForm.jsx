import { useState } from "react";
import axios from "axios";

const CoachForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    sport: "",
    coachId: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/coaches", formData);
      alert("Coach added successfully!");
      onSuccess(); // close modal
    } catch (err) {
      alert(err.response?.data?.message || "Error adding coach");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name</label>
      <input name="name" value={formData.name} onChange={handleChange} required />

      <label>Email</label>
      <input name="email" type="email" value={formData.email} onChange={handleChange} required />

      <label>Sport</label>
      <input name="sport" value={formData.sport} onChange={handleChange} required />

      <label>Coach ID</label>
      <input name="coachId" value={formData.coachId} onChange={handleChange} required />

      <button type="submit">Submit</button>
    </form>
  );
};

export default CoachForm;