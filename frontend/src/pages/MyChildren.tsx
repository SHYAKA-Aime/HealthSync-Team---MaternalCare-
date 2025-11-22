import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";
import { childService } from "../services/childService";
import { getUser } from "../utils/auth";
import { calculateAge, formatDate } from "../utils/formatters";

const MyChildren = () => {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [motherData, setMotherData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    gender: "female",
    birth_weight: "",
    birth_height: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allMothers = await motherService.getMothers();
      const currentMother = allMothers.find(
        (m: any) => m.user_id === user.user_id
      );

      if (currentMother) {
        setMotherData(currentMother);
        const childrenData = await childService.getChildrenByMother(
          currentMother.mother_id
        );
        setChildren(childrenData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await childService.createChild({
        mother_id: motherData.mother_id,
        ...formData,
        birth_weight: formData.birth_weight
          ? parseFloat(formData.birth_weight)
          : null,
        birth_height: formData.birth_height
          ? parseFloat(formData.birth_height)
          : null,
      });

      setIsModalOpen(false);
      setFormData({
        full_name: "",
        dob: "",
        gender: "female",
        birth_weight: "",
        birth_height: "",
      });
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add child");
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="mother" />
          <main className="flex-1 p-8">
            <Card>
              <p className="text-center text-gray-600 py-8">
                Please complete your profile first before adding children.
              </p>
              <Link
                to="/my-profile"
                className="block text-center text-blue-600 hover:text-blue-700"
              >
                Go to My Profile
              </Link>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar role="mother" />

        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
              {/* <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                + Add Child
              </Button> */}
            </div>

            {children.length === 0 ? (
              <Card>
                <p className="text-center text-gray-600 py-12">
                  No children registered yet. Click "Add Child" to get started.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children.map((child) => {
                  const age = calculateAge(child.dob);
                  return (
                    <Card
                      key={child.child_id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {child.full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {child.full_name}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Age:</span>{" "}
                              {age.years
                                ? `${age.years} years`
                                : `${age.months} months`}
                            </p>
                            <p>
                              <span className="font-medium">Gender:</span>{" "}
                              {child.gender}
                            </p>
                            <p>
                              <span className="font-medium">
                                Date of Birth:
                              </span>{" "}
                              {formatDate(child.dob)}
                            </p>
                            {child.birth_weight && (
                              <p>
                                <span className="font-medium">
                                  Birth Weight:
                                </span>{" "}
                                {child.birth_weight} kg
                              </p>
                            )}
                          </div>
                          <Link
                            to={`/child/${child.child_id}`}
                            className="inline-block mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                          >
                            View Full Profile/Vaccination history
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Child Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Child"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              required
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birth Weight (kg)
              </label>
              <Input
                type="number"
                step="0.1"
                value={formData.birth_weight}
                onChange={(e) =>
                  setFormData({ ...formData, birth_weight: e.target.value })
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
                value={formData.birth_height}
                onChange={(e) =>
                  setFormData({ ...formData, birth_height: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={saving}
            >
              {saving ? <Loader /> : "Add Child"}
            </Button>
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyChildren;
