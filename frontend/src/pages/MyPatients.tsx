import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";
import { calculatePregnancyWeek } from "../utils/formatters";

const MyPatients = () => {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        (patient) =>
          patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const mothersData = await motherService.getMothers();
      setPatients(mothersData);
      setFilteredPatients(mothersData);
    } catch (err) {
      console.error("Error fetching patients:", err);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="health_worker" />

      <div className="flex">
        <Sidebar role="health_worker" />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
              <div className="w-96">
                <Input
                  type="text"
                  placeholder="Search by name, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                Total Patients:{" "}
                <span className="font-semibold">{filteredPatients.length}</span>
              </p>
            </div>

            {filteredPatients.length === 0 ? (
              <Card>
                <p className="text-center text-gray-500 py-12">
                  {searchTerm
                    ? "No patients found matching your search"
                    : "No patients registered yet"}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => {
                  const week = patient.expected_delivery
                    ? calculatePregnancyWeek(patient.expected_delivery)
                    : null;

                  return (
                    <Card
                      key={patient.mother_id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {patient.full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {patient.full_name}
                          </h3>
                          <p className="text-sm text-gray-600 truncate">
                            {patient.email}
                          </p>
                          {week && (
                            <p className="text-sm text-gray-600 mt-1">
                              Week {week} • {patient.pregnancy_stage}
                            </p>
                          )}
                          {patient.location && (
                            <p className="text-sm text-gray-600 mt-1">
                              {patient.location}
                            </p>
                          )}
                          <Link
                            to={`/patient/${patient.mother_id}`}
                            className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700"
                          >
                            View Details →
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
    </div>
  );
};

export default MyPatients;
