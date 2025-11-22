import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Loader from "../components/Loader";
import { visitService } from "../services/visitService";
import { motherService } from "../services/motherService";
import { getUser } from "../utils/auth";
import { formatDate } from "../utils/formatters";

const Visits = () => {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const allMothers = await motherService.getMothers();
      const currentMother = allMothers.find(
        (m: any) => m.user_id === user.user_id
      );

      if (currentMother) {
        const visitsData = await visitService.getVisitsByMother(
          currentMother.mother_id
        );
        setVisits(
          visitsData.sort(
            (a: any, b: any) =>
              new Date(b.visit_date).getTime() -
              new Date(a.visit_date).getTime()
          )
        );
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
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
      <Navbar />

      <div className="flex">
        <Sidebar role="mother" />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              My Appointments & Visits
            </h1>

            {visits.length === 0 ? (
              <Card>
                <p className="text-center text-gray-500 py-12">
                  No visits recorded yet. Your healthcare provider will record
                  your visits.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visits List */}
                <div className="lg:col-span-2">
                  <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Visit History
                    </h2>
                    <div className="space-y-4">
                      {visits.map((visit) => (
                        <div
                          key={visit.visit_id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedVisit?.visit_id === visit.visit_id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                          onClick={() => setSelectedVisit(visit)}
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
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Completed
                            </span>
                          </div>
                          {visit.notes && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {visit.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Visit Details */}
                <div className="lg:col-span-1">
                  <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Visit Details
                    </h2>
                    {selectedVisit ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(selectedVisit.visit_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {selectedVisit.visit_type}
                          </p>
                        </div>
                        {selectedVisit.weight && (
                          <div>
                            <p className="text-sm text-gray-600">Weight</p>
                            <p className="font-semibold text-gray-900">
                              {selectedVisit.weight} kg
                            </p>
                          </div>
                        )}
                        {selectedVisit.blood_pressure && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Blood Pressure
                            </p>
                            <p className="font-semibold text-gray-900">
                              {selectedVisit.blood_pressure}
                            </p>
                          </div>
                        )}
                        {selectedVisit.notes && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Notes</p>
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                              {selectedVisit.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        Select a visit to view details
                      </p>
                    )}
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Visits;
