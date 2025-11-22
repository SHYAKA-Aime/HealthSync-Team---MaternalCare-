import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { vaccinationService } from "../services/vaccinationService";
import { childService } from "../services/childService";
import { motherService } from "../services/motherService";

const RecordVaccination = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mothers, setMothers] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedMother, setSelectedMother] = useState("");
  const [formData, setFormData] = useState({
    child_id: "",
    vaccine_name: "",
    date_given: new Date().toISOString().split("T")[0],
    next_due_date: "",
    administered_by: "",
    batch_number: "",
    notes: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMothers();
  }, []);

  useEffect(() => {
    if (selectedMother) {
      fetchChildren();
    }
  }, [selectedMother]);

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

  const fetchChildren = async () => {
    try {
      const childrenData = await childService.getChildrenByMother(
        parseInt(selectedMother)
      );
      setChildren(childrenData);
    } catch (err) {
      console.error("Error fetching children:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await vaccinationService.createVaccination({
        child_id: parseInt(formData.child_id),
        vaccine_name: formData.vaccine_name,
        date_given: formData.date_given,
        next_due_date: formData.next_due_date || undefined,
        administered_by: formData.administered_by || undefined,
        batch_number: formData.batch_number || undefined,
        notes: formData.notes || undefined,
      });

      setSuccess("Vaccination recorded successfully!");
      setFormData({
        child_id: "",
        vaccine_name: "",
        date_given: new Date().toISOString().split("T")[0],
        next_due_date: "",
        administered_by: "",
        batch_number: "",
        notes: "",
      });
      setSelectedMother("");

      setTimeout(() => navigate("/worker-dashboard"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record vaccination");
    } finally {
      setSaving(false);
    }
  };

  const commonVaccines = [
    "BCG",
    "OPV 0",
    "OPV 1",
    "OPV 2",
    "OPV 3",
    "Pentavalent 1",
    "Pentavalent 2",
    "Pentavalent 3",
    "PCV 1",
    "PCV 2",
    "PCV 3",
    "Rota 1",
    "Rota 2",
    "Measles-Rubella 1",
    "Measles-Rubella 2",
  ];

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
              Record Vaccination
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
                    Select Mother *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedMother}
                    onChange={(e) => {
                      setSelectedMother(e.target.value);
                      setFormData({ ...formData, child_id: "" });
                    }}
                    required
                  >
                    <option value="">Choose a mother...</option>
                    {mothers.map((mother) => (
                      <option key={mother.mother_id} value={mother.mother_id}>
                        {mother.full_name} - {mother.email}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMother && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Child *
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.child_id}
                      onChange={(e) =>
                        setFormData({ ...formData, child_id: e.target.value })
                      }
                      required
                    >
                      <option value="">Choose a child...</option>
                      {children.map((child) => (
                        <option key={child.child_id} value={child.child_id}>
                          {child.full_name} - {child.gender}, DOB: {child.dob}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vaccine Name *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.vaccine_name}
                    onChange={(e) =>
                      setFormData({ ...formData, vaccine_name: e.target.value })
                    }
                    required
                  >
                    <option value="">Select vaccine...</option>
                    {commonVaccines.map((vaccine) => (
                      <option key={vaccine} value={vaccine}>
                        {vaccine}
                      </option>
                    ))}
                    <option value="other">Other (specify in notes)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Given *
                    </label>
                    <Input
                      type="date"
                      value={formData.date_given}
                      onChange={(e) =>
                        setFormData({ ...formData, date_given: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Due Date
                    </label>
                    <Input
                      type="date"
                      value={formData.next_due_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          next_due_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Administered By
                    </label>
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={formData.administered_by}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          administered_by: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Number
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., BCG2025-001"
                      value={formData.batch_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          batch_number: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Any additional notes or observations..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-8"
                    disabled={saving}
                  >
                    {saving ? <Loader /> : "Record Vaccination"}
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

export default RecordVaccination;
