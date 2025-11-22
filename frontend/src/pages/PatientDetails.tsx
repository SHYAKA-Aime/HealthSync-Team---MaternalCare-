import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";
import { childService } from "../services/childService";
import { visitService } from "../services/visitService";
import {
  calculatePregnancyWeek,
  formatDate,
  calculateAge,
} from "../utils/formatters";

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const patientData = await motherService.getMother(parseInt(id!));
      setPatient(patientData);

      const childrenData = await childService.getChildrenByMother(
        parseInt(id!)
      );
      setChildren(childrenData);

      const visitsData = await visitService.getVisitsByMother(parseInt(id!));
      setVisits(
        visitsData.sort(
          (a: any, b: any) =>
            new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching patient data:", error);
      navigate("/my-patients");
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

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Patient not found</p>
      </div>
    );
  }

  const pregnancyWeek = patient.expected_delivery
    ? calculatePregnancyWeek(patient.expected_delivery)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="health_worker" />

      <div className="flex">
        <Sidebar role="health_worker" />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <Button
              onClick={() => navigate("/my-patients")}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              ← Back to Patients
            </Button>

            {/* Patient Header */}
            <Card className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-3xl">
                    {patient.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {patient.full_name}
                    </h1>
                    <div className="space-y-1 text-gray-600">
                      <p>Email: {patient.email}</p>
                      {patient.phone && <p>Phone: {patient.phone}</p>}
                      {patient.location && <p>Location: {patient.location}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      navigate(`/record-visit?mother_id=${patient.mother_id}`)
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Record Visit
                  </Button>

                  <Link to="/register-child">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                      + Register Child
                    </Button>
                  </Link>

                  <Button
                    onClick={() =>
                      navigate(`/edit-profile/${patient.mother_id}`)
                    }
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </Card>

            {/* Patient Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <h3 className="text-sm text-gray-600 mb-1">Age</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {patient.age || "N/A"}
                </p>
              </Card>
              <Card>
                <h3 className="text-sm text-gray-600 mb-1">Blood Group</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {patient.blood_group || "N/A"}
                </p>
              </Card>
              <Card>
                <h3 className="text-sm text-gray-600 mb-1">Pregnancy Stage</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {pregnancyWeek ? `Week ${pregnancyWeek}` : "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {patient.pregnancy_stage || "N/A"}
                </p>
              </Card>
            </div>

            {/* Medical Information */}
            {patient.medical_conditions && (
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Medical Conditions
                </h2>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {patient.medical_conditions}
                </p>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Children */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Children ({children.length})
                  </h2>
                </div>
                {children.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No children registered
                  </p>
                ) : (
                  <div className="space-y-3">
                    {children.map((child) => {
                      const age = calculateAge(child.dob);
                      return (
                        <div
                          key={child.child_id}
                          className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {child.full_name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {child.full_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {age.years
                                  ? `${age.years} years`
                                  : `${age.months} months`}{" "}
                                • {child.gender}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() =>
                              navigate(
                                `/record-vaccination?child_id=${child.child_id}`
                              )
                            }
                            className="bg-green-100 text-green-600 hover:bg-green-200 text-sm px-3 py-1"
                          >
                            Vaccinate
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Visit History */}
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Visit History ({visits.length})
                </h2>
                {visits.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No visits recorded
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {visits.map((visit) => (
                      <div
                        key={visit.visit_id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 capitalize">
                              {visit.visit_type} Visit
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(visit.visit_date)}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            Completed
                          </span>
                        </div>
                        {visit.weight && (
                          <p className="text-sm text-gray-600">
                            Weight: {visit.weight} kg
                          </p>
                        )}
                        {visit.blood_pressure && (
                          <p className="text-sm text-gray-600">
                            BP: {visit.blood_pressure}
                          </p>
                        )}
                        {visit.notes && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {visit.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDetails;
