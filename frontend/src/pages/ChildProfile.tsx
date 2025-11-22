import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { childService } from "../services/childService";
import { vaccinationService } from "../services/vaccinationService";
import { calculateAge, formatDate } from "../utils/formatters";
import { getUser } from "../utils/auth";

const ChildProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<any>(null);
  const [vaccinations, setVaccinations] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchChildData();
    }
  }, [id]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const childData = await childService.getChild(parseInt(id!));
      setChild(childData);

      const vaccinationsData = await vaccinationService.getVaccinationsByChild(
        parseInt(id!)
      );
      setVaccinations(vaccinationsData);
    } catch (error) {
      console.error("Error fetching child data:", error);
      navigate("/my-children");
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

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Child not found</p>
      </div>
    );
  }

  const age = calculateAge(child.dob);

  // Kenya Vaccination Schedule
  const vaccinationSchedule = [
    {
      name: "BCG",
      age: "At birth",
      description: "Protects against tuberculosis",
    },
    { name: "OPV 0", age: "At birth", description: "Oral polio vaccine" },
    {
      name: "OPV 1",
      age: "6 weeks",
      description: "Oral polio vaccine - 1st dose",
    },
    {
      name: "Pentavalent 1",
      age: "6 weeks",
      description: "DPT-HepB-Hib vaccine",
    },
    { name: "PCV 1", age: "6 weeks", description: "Pneumococcal vaccine" },
    { name: "Rota 1", age: "6 weeks", description: "Rotavirus vaccine" },
    {
      name: "OPV 2",
      age: "10 weeks",
      description: "Oral polio vaccine - 2nd dose",
    },
    {
      name: "Pentavalent 2",
      age: "10 weeks",
      description: "DPT-HepB-Hib vaccine",
    },
    { name: "PCV 2", age: "10 weeks", description: "Pneumococcal vaccine" },
    { name: "Rota 2", age: "10 weeks", description: "Rotavirus vaccine" },
    {
      name: "OPV 3",
      age: "14 weeks",
      description: "Oral polio vaccine - 3rd dose",
    },
    {
      name: "Pentavalent 3",
      age: "14 weeks",
      description: "DPT-HepB-Hib vaccine",
    },
    { name: "PCV 3", age: "14 weeks", description: "Pneumococcal vaccine" },
    {
      name: "Measles-Rubella 1",
      age: "9 months",
      description: "Protects against measles and rubella",
    },
    { name: "Measles-Rubella 2", age: "18 months", description: "Second dose" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar role={user.role} />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <Button
              onClick={() => navigate("/my-children")}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              ← Back to My Children
            </Button>

            {/* Child Header */}
            <Card className="mb-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                  {child.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {child.full_name}
                  </h1>
                  <div className="flex gap-6 text-gray-600">
                    <span>
                      Age:{" "}
                      {age.years
                        ? `${age.years} years`
                        : `${age.months} months`}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{child.gender}</span>
                    <span>•</span>
                    <span>DOB: {formatDate(child.dob)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Birth Information */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Birth Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Birth Weight</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {child.birth_weight
                      ? `${child.birth_weight} kg`
                      : "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Birth Height</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {child.birth_height
                      ? `${child.birth_height} cm`
                      : "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Age</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {age.years ? `${age.years} years` : `${age.months} months`}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vaccination History */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Vaccination History
                  </h2>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {vaccinations.length} vaccines given
                  </span>
                </div>

                {vaccinations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No vaccinations recorded yet
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {vaccinations.map((vaccination) => (
                      <div
                        key={vaccination.vaccine_id}
                        className="border rounded-lg p-4 border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {vaccination.vaccine_name}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Date Given:</span>{" "}
                                {formatDate(vaccination.date_given)}
                              </div>
                              {vaccination.next_due_date && (
                                <div>
                                  <span className="font-medium">Next Due:</span>{" "}
                                  {formatDate(vaccination.next_due_date)}
                                </div>
                              )}
                              {vaccination.administered_by && (
                                <div>
                                  <span className="font-medium">
                                    Administered by:
                                  </span>{" "}
                                  {vaccination.administered_by}
                                </div>
                              )}
                              {vaccination.batch_number && (
                                <div>
                                  <span className="font-medium">
                                    Batch Number:
                                  </span>{" "}
                                  {vaccination.batch_number}
                                </div>
                              )}
                            </div>
                            {vaccination.notes && (
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Notes:</span>{" "}
                                {vaccination.notes}
                              </p>
                            )}
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Vaccination Schedule */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {child.full_name}'s Vaccination Schedule
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {vaccinationSchedule.map((vaccine, index) => {
                    const isGiven = vaccinations.some(
                      (v: any) =>
                        v.vaccine_name.toLowerCase().trim() ===
                        vaccine.name.toLowerCase().trim()
                    );

                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          isGiven
                            ? "border-green-300 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {vaccine.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {vaccine.age}
                            </p>
                          </div>
                          {isGiven && (
                            <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                              ✓ Done
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {vaccine.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChildProfile;
