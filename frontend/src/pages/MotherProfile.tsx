import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";
import { getUser } from "../utils/auth";
import { formatDate, calculatePregnancyWeek } from "../utils/formatters";

const MotherProfile = () => {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [motherData, setMotherData] = useState<any>(null);

  useEffect(() => {
    fetchMotherProfile();
  }, []);

  const fetchMotherProfile = async () => {
    try {
      setLoading(true);
      const allMothers = await motherService.getMothers();
      const currentMother = allMothers.find(
        (m: any) => m.user_id === user.user_id
      );
      setMotherData(currentMother);
    } catch (err) {
      console.error("Error fetching mother profile:", err);
    } finally {
      setLoading(false);
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
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">
                My Profile
              </h1>
              <Card>
                <p className="text-center text-gray-600 py-8">
                  Your profile has not been created yet. Please visit your
                  healthcare provider to set up your profile.
                </p>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const pregnancyWeek = motherData.expected_delivery
    ? calculatePregnancyWeek(motherData.expected_delivery)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar role="mother" />

        <main className="flex-1 p-8">
          <div className="max-w-3xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-2">
                To update your information, please contact your healthcare
                provider.
              </p>
            </div>

            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full Name</p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.age || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Blood Group</p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.blood_group || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.location || "Not provided"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pregnancy Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pregnancy Stage</p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.pregnancy_stage || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Week</p>
                  <p className="text-lg font-medium text-gray-900">
                    {pregnancyWeek ? `Week ${pregnancyWeek}` : "Not calculated"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Expected Delivery
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.expected_delivery
                      ? formatDate(motherData.expected_delivery)
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Emergency Contact
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    {motherData.emergency_contact || "Not provided"}
                  </p>
                </div>
              </div>
            </Card>

            {motherData.medical_conditions && (
              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Medical Conditions
                </h2>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-gray-700">
                    {motherData.medical_conditions}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MotherProfile;
