import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { visitService } from "../services/visitService";
import { motherService } from "../services/motherService";

const RecordVisit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mothers, setMothers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    mother_id: "",
    visit_date: new Date().toISOString().split("T")[0],
    visit_type: "antenatal",
    weight: "",
    blood_pressure: "",
    notes: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMothers();
  }, []);

  const fetchMothers = async () => {
    try {
      setLoading(true);
      const mothersData = await motherService.getMothers();
      setMothers(mothersData);
    } catch (err) {
      console.error("Error fetching mothers:", err);
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
      await visitService.createVisit({
        mother_id: parseInt(formData.mother_id),
        visit_date: formData.visit_date,
        visit_type: formData.visit_type,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        blood_pressure: formData.blood_pressure || undefined,
        notes: formData.notes || undefined,
      });

      setSuccess("Visit recorded successfully!");
      setFormData({
        mother_id: "",
        visit_date: new Date().toISOString().split("T")[0],
        visit_type: "antenatal",
        weight: "",
        blood_pressure: "",
        notes: "",
      });

      setTimeout(() => navigate("/worker-dashboard"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record visit");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="health_worker" />

      <div className="flex">
        <Sidebar role="health_worker" />

        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Record Visit
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.mother_id}
                    onChange={(e) =>
                      setFormData({ ...formData, mother_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {mothers.map((mother) => (
                      <option key={mother.mother_id} value={mother.mother_id}>
                        {mother.full_name} - {mother.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.visit_date}
                      onChange={(e) =>
                        setFormData({ ...formData, visit_date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Type *
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.visit_type}
                      onChange={(e) =>
                        setFormData({ ...formData, visit_type: e.target.value })
                      }
                      required
                    >
                      <option value="antenatal">Antenatal</option>
                      <option value="postnatal">Postnatal</option>
                      <option value="general">General Checkup</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 65.5"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Pressure
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., 120/80"
                      value={formData.blood_pressure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blood_pressure: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes / Observations
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                    placeholder="Enter any notes, observations, or recommendations..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                    disabled={saving}
                  >
                    {saving ? <Loader /> : "Record Visit"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate("/worker-dashboard")}
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

export default RecordVisit;
