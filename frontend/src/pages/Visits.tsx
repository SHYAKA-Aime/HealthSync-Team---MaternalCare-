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
  const [filter, setFilter] = useState<string>("all"); // all, scheduled, completed, cancelled

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

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        label: "Scheduled",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Completed",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Cancelled",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.scheduled;
    return (
      <span
        className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-medium`}
      >
        {config.label}
      </span>
    );
  };

  // Filter visits based on selected filter
  const filteredVisits =
    filter === "all" ? visits : visits.filter((v) => v.status === filter);

  // Separate upcoming and past visits
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingVisits = filteredVisits.filter((v) => v.visit_date >= todayStr);
  const pastVisits = filteredVisits.filter((v) => v.visit_date < todayStr);

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
              <>
                {/* Filter Tabs */}
                <div className="mb-6 flex gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All ({visits.length})
                  </button>
                  <button
                    onClick={() => setFilter("scheduled")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "scheduled"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Scheduled (
                    {visits.filter((v) => v.status === "scheduled").length})
                  </button>
                  <button
                    onClick={() => setFilter("completed")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "completed"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Completed (
                    {visits.filter((v) => v.status === "completed").length})
                  </button>
                  <button
                    onClick={() => setFilter("cancelled")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === "cancelled"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Cancelled (
                    {visits.filter((v) => v.status === "cancelled").length})
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Visits List */}
                  <div className="lg:col-span-2">
                    <Card>
                      {/* Upcoming Visits */}
                      {upcomingVisits.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Upcoming Appointments
                          </h2>
                          <div className="space-y-4">
                            {upcomingVisits.map((visit) => (
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
                                      {visit.visit_date === todayStr && (
                                        <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white rounded text-xs">
                                          Today
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  {getStatusBadge(visit.status)}
                                </div>
                                {visit.notes && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {visit.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Past Visits */}
                      {pastVisits.length > 0 && (
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Past Visits
                          </h2>
                          <div className="space-y-4">
                            {pastVisits.map((visit) => (
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
                                  {getStatusBadge(visit.status)}
                                </div>
                                {visit.notes && (
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {visit.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredVisits.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                          No {filter !== "all" ? filter : ""} visits found
                        </p>
                      )}
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
                            <p className="text-sm text-gray-600">Status</p>
                            <div className="mt-1">
                              {getStatusBadge(selectedVisit.status)}
                            </div>
                          </div>
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
                              <p className="text-sm text-gray-600 mb-1">
                                Notes
                              </p>
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
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Visits;
