import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";

const EditMotherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [motherData, setMotherData] = useState<any>(null);
  const [formData, setFormData] = useState({
    age: "",
    blood_group: "",
    pregnancy_stage: "",
    expected_delivery: "",
    location: "",
    medical_conditions: "",
    emergency_contact: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchMotherProfile();
    }
  }, [id]);

  // Helper function to convert date to YYYY-MM-DD format
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      // Format to YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  const fetchMotherProfile = async () => {
    try {
      setLoading(true);
      const mother = await motherService.getMother(parseInt(id!));
      setMotherData(mother);
      setFormData({
        age: mother.age?.toString() || "",
        blood_group: mother.blood_group || "",
        pregnancy_stage: mother.pregnancy_stage || "",
        expected_delivery: formatDateForInput(mother.expected_delivery),
        location: mother.location || "",
        medical_conditions: mother.medical_conditions || "",
        emergency_contact: mother.emergency_contact || "",
      });
    } catch (err) {
      console.error("Error fetching mother profile:", err);
      navigate("/my-patients");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (motherData) {
        // Prepare data with proper formatting
        // CRITICAL: Convert empty strings to null for optional fields
        const updateData: any = {
          age: formData.age ? parseInt(formData.age) : undefined,
          blood_group: formData.blood_group.trim() || null,
          pregnancy_stage: formData.pregnancy_stage.trim() || null,
          expected_delivery: formData.expected_delivery.trim() || null, // Empty string becomes null
          location: formData.location.trim() || null,
          medical_conditions: formData.medical_conditions.trim() || null,
          emergency_contact: formData.emergency_contact.trim() || null,
        };

        await motherService.updateMother(motherData.mother_id, updateData);

        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate(`/patient/${motherData.mother_id}`), 2000);
      } else {
        setError("Mother data not found");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!motherData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Mother profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="health_worker" />

      <div className="flex">
        <Sidebar role="health_worker" />

        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            <Button
              onClick={() => navigate(`/patient/${motherData.mother_id}`)}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              ← Back to Patient
            </Button>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Edit Profile - {motherData.full_name}
            </h1>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={motherData.full_name}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={motherData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.blood_group}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            blood_group: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pregnancy Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Pregnancy Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pregnancy Stage
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.pregnancy_stage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pregnancy_stage: e.target.value,
                          })
                        }
                      >
                        <option value="">Gave Birth</option>
                        <option value="First Trimester">
                          First Trimester (Weeks 1-12)
                        </option>
                        <option value="Second Trimester">
                          Second Trimester (Weeks 13-26)
                        </option>
                        <option value="Third Trimester">
                          Third Trimester (Weeks 27-40)
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Delivery Date
                      </label>
                      <Input
                        type="date"
                        value={formData.expected_delivery}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expected_delivery: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        type="text"
                        placeholder="e.g., Kigali, Gasabo"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <Input
                        type="tel"
                        placeholder="+250788000000"
                        value={formData.emergency_contact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergency_contact: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Medical Information
                  </h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions (if any)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="List any medical conditions, allergies, or important health information..."
                      value={formData.medical_conditions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medical_conditions: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                    disabled={saving}
                  >
                    {saving ? <Loader /> : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate(`/patient/${motherData.mother_id}`)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditMotherProfile;
