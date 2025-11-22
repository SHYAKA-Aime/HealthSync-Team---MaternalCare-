import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { visitService } from "../services/visitService";
import { motherService } from "../services/motherService";
import { vaccinationService } from "../services/vaccinationService";
import { formatDate, calculatePregnancyWeek } from "../utils/formatters";

const WorkerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaysVisits: 0,
    upcomingVisits: 0,
    totalPatients: 0,
    totalVaccinations: 0,
  });
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [allVisits, allMothers, allVaccinations] = await Promise.all([
        visitService.getVisits(),
        motherService.getMothers(),
        vaccinationService.getVaccinations(),
      ]);

      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD local
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Today's visits
      const visitsToday = allVisits.filter((v: any) => {
        const visitDateStr = new Date(v.visit_date).toLocaleDateString("en-CA");
        return visitDateStr === todayStr && v.status !== "completed";
      });

      // Upcoming visits (after today)
      const upcoming = allVisits
        .filter(
          (v: any) => new Date(v.visit_date) > today && v.status !== "completed"
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
        );

      // Decide which visits to display: today if available, else nearest upcoming
      const displayedVisits =
        visitsToday.length > 0 ? visitsToday : upcoming.slice(0, 6);

      setStats({
        todaysVisits: visitsToday.length,
        upcomingVisits: upcoming.length,
        totalPatients: allMothers.length,
        totalVaccinations: allVaccinations.length,
      });

      setUpcomingVisits(displayedVisits);

      // Recent patients
      const recentMothers = allMothers
        .slice(0, 4)
        .map((mother: any, idx: number) => {
          const colors = [
            "bg-blue-500",
            "bg-orange-500",
            "bg-green-500",
            "bg-purple-500",
          ];
          const week = mother.expected_delivery
            ? calculatePregnancyWeek(mother.expected_delivery)
            : null;
          return {
            ...mother,
            initial: mother.full_name
              .split(" ")
              .map((n: string) => n[0])
              .join(""),
            color: colors[idx % colors.length],
            week: week,
          };
        });

      setRecentPatients(recentMothers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Good morning, Nurse Sarah
            </h1>
            <p className="text-gray-600">
              City Clinic - Maternal Health Department
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-t-4 border-blue-500">
              <div className="mb-2 text-sm text-gray-600">
                Today's Appointments
              </div>
              <div className="text-4xl font-bold text-gray-900">
                {stats.todaysVisits}
              </div>
            </Card>

            <Card className="border-t-4 border-orange-500">
              <div className="mb-2 text-sm text-gray-600">Upcoming Visits</div>
              <div className="text-4xl font-bold text-gray-900">
                {stats.upcomingVisits}
              </div>
              <p className="text-xs text-gray-500 mt-1">After tomorrow</p>
            </Card>

            <Card className="border-t-4 border-green-500">
              <div className="mb-2 text-sm text-gray-600">My Patients</div>
              <div className="text-4xl font-bold text-gray-900">
                {stats.totalPatients}
              </div>
            </Card>

            {/* <Card className="border-t-4 border-purple-500">
              <div className="mb-2 text-sm text-gray-600">Vaccinations</div>
              <div className="text-4xl font-bold text-gray-900">
                {stats.totalVaccinations}
              </div>
            </Card> */}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              <Link to="/record-visit">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4">
                  + Record Visit
                </Button>
              </Link>
              <Link to="/record-vaccination">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4">
                  + Record Vaccination
                </Button>
              </Link>
              {/* <Link to="/register-child">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4">
                  + Register Child
                </Button>
              </Link> */}
              <Link to="/my-patients">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4">
                  View Patients
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Upcoming Appointments
              </h2>
              <Card>
                {upcomingVisits.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No upcoming appointments
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200">
                        <tr className="text-left text-xs text-gray-600 uppercase">
                          <th className="pb-3 font-medium">DATE</th>
                          <th className="pb-3 font-medium">PATIENT</th>
                          <th className="pb-3 font-medium">TYPE</th>
                          <th className="pb-3 font-medium">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {upcomingVisits.map((visit) => (
                          <tr
                            key={visit.visit_id}
                            className="border-b border-gray-100"
                          >
                            <td className="py-4">
                              {formatDate(visit.visit_date)}
                            </td>
                            <td className="py-4 font-medium">
                              {visit.mother_name || "Unknown"}
                            </td>
                            <td className="py-4 capitalize">
                              {visit.visit_type}
                            </td>
                            <td className="py-4">
                              <Link
                                to={`/visit/${visit.visit_id}`}
                                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Patients */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent Patients
              </h2>
              {recentPatients.length === 0 ? (
                <Card>
                  <p className="text-gray-500 text-center py-8">
                    No patients registered yet
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <Card
                      key={patient.mother_id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full ${patient.color} flex items-center justify-center text-white font-bold`}
                        >
                          {patient.initial}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {patient.week
                              ? `Week ${patient.week}`
                              : "Postnatal"}{" "}
                            • {patient.pregnancy_stage || "N/A"}
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`/patient/${patient.mother_id}`}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                      >
                        View
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkerDashboard;
