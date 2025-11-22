import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { childService } from "../services/childService";
import { motherService } from "../services/motherService";

const RegisterChild = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedMotherId = searchParams.get("mother_id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mothers, setMothers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    mother_id: preSelectedMotherId || "",
    full_name: "",
    dob: "",
    gender: "female",
    birth_weight: "",
    birth_height: "",
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
      await childService.createChild({
        mother_id: parseInt(formData.mother_id),
        full_name: formData.full_name,
        dob: formData.dob,
        gender: formData.gender as "male" | "female",
        birth_weight: formData.birth_weight
          ? parseFloat(formData.birth_weight)
          : undefined,
        birth_height: formData.birth_height
          ? parseFloat(formData.birth_height)
          : undefined,
      });

      setSuccess("Child registered successfully!");
      setFormData({
        mother_id: "",
        full_name: "",
        dob: "",
        gender: "female",
        birth_weight: "",
        birth_height: "",
      });

      setTimeout(() => navigate("/my-patients"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register child");
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
              Register Child
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
                    value={formData.mother_id}
                    onChange={(e) =>
                      setFormData({ ...formData, mother_id: e.target.value })
                    }
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Baby John Doe"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Weight (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 3.2"
                      value={formData.birth_weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birth_weight: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Height (cm)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 48.5"
                      value={formData.birth_height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          birth_height: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                    disabled={saving}
                  >
                    {saving ? <Loader /> : "Register Child"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate("/my-patients")}
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

export default RegisterChild;
