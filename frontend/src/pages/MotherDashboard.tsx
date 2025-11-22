import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";
import { childService } from "../services/childService";
import { visitService } from "../services/visitService";
import { getUser } from "../utils/auth";
import {
  calculatePregnancyWeek,
  formatDate,
  calculateAge,
} from "../utils/formatters";

const MotherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [motherData, setMotherData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [pastVisits, setPastVisits] = useState<any[]>([]);
  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get all mothers and find current user's mother profile
      const allMothers = await motherService.getMothers();
      const currentMother = allMothers.find(
        (m: any) => m.user_id === user.user_id
      );

      if (currentMother) {
        setMotherData(currentMother);

        // Fetch children for this mother
        const childrenData = await childService.getChildrenByMother(
          currentMother.mother_id
        );
        setChildren(childrenData);

        // Fetch visits for this mother
        const visitsData = await visitService.getVisitsByMother(
          currentMother.mother_id
        );

        // Create today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only visits with status = "scheduled"
        const scheduledVisits = visitsData.filter(
          (v: any) => v.status === "scheduled"
        );

        // Separate upcoming and past based on date
        const upcoming = scheduledVisits.filter((visit: any) => {
          const visitDate = new Date(visit.visit_date);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate >= today;
        });

        const past = scheduledVisits.filter((visit: any) => {
          const visitDate = new Date(visit.visit_date);
          visitDate.setHours(0, 0, 0, 0);
          return visitDate < today;
        });

        // Sort upcoming visits by date (earliest first)
        upcoming.sort((a: any, b: any) => {
          return (
            new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
          );
        });

        // Sort past visits by date (most recent first)
        past.sort((a: any, b: any) => {
          return (
            new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
          );
        });

        setUpcomingVisits(upcoming);
        setPastVisits(past.slice(0, 3)); // Get last 3 past visits
      }
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

  // Determine if mother has given birth by checking if pregnancy_stage is empty
  const hasGivenBirth =
    !motherData?.pregnancy_stage || motherData?.pregnancy_stage.trim() === "";

  const pregnancyWeek = motherData?.expected_delivery
    ? calculatePregnancyWeek(motherData.expected_delivery)
    : 0;

  // Find youngest child for postpartum display
  const youngestChild =
    children.length > 0
      ? children.reduce((youngest, child) => {
          return new Date(child.dob) > new Date(youngest.dob)
            ? child
            : youngest;
        })
      : null;

  // Get next upcoming appointment
  const nextAppointment = upcomingVisits.length > 0 ? upcomingVisits[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar role="mother" />

        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-600">Here's your health summary</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Next Appointment */}
            <Card className="border-t-4 border-blue-500">
              <div className="mb-2 text-sm text-gray-600">Next Appointment</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {nextAppointment ? (
                  <>
                    {formatDate(nextAppointment.visit_date).split(",")[0]}
                    {new Date(nextAppointment.visit_date).setHours(
                      0,
                      0,
                      0,
                      0
                    ) === new Date().setHours(0, 0, 0, 0) ? (
                      <span className="text-xl text-green-600"> (TODAY)</span>
                    ) : null}
                  </>
                ) : (
                  "No upcoming"
                )}
              </div>

              <div className="text-sm text-gray-600">
                {nextAppointment
                  ? `${
                      nextAppointment.visit_type.charAt(0).toUpperCase() +
                      nextAppointment.visit_type.slice(1)
                    } Visit`
                  : "Schedule your next visit"}
              </div>
              {nextAppointment?.notes && (
                <div className="text-xs text-gray-500 mt-2">
                  {nextAppointment.notes}
                </div>
              )}
            </Card>

            {/* Pregnancy Week or Birth Status */}
            {hasGivenBirth ? (
              <Card className="border-t-4 border-green-500">
                <div className="mb-2 text-sm text-gray-600">
                  Pregnancy Status
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  Postpartum Care
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {youngestChild
                    ? `Birth: ${formatDate(youngestChild.dob)}`
                    : "Recovery phase"}
                </div>
                <Button
                  onClick={() => navigate("/pregnancy-tips")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  View Postpartum Tips
                </Button>
              </Card>
            ) : (
              <Card className="border-t-4 border-green-500">
                <div className="mb-2 text-sm text-gray-600">Pregnancy Week</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  Week {pregnancyWeek}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {motherData?.pregnancy_stage || "N/A"}
                </div>
                <Button
                  onClick={() => navigate("/pregnancy-tips")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  View Tips & Guidance
                </Button>
              </Card>
            )}

            {/* My Children */}
            <Card className="border-t-4 border-orange-500">
              <div className="mb-2 text-sm text-gray-600">My Children</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {children.length}
              </div>
              <div className="text-sm text-gray-600">
                {children.length === 0
                  ? "No children registered"
                  : children.length === 1
                  ? "Child registered"
                  : "All vaccinations tracked"}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming & Recent Visits */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Appointments & Visits
              </h2>
              <Card>
                {/* Upcoming Visits Section */}
                {upcomingVisits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-blue-600 mb-3">
                      UPCOMING APPOINTMENTS
                    </h3>
                    <div className="space-y-3">
                      {upcomingVisits.slice(0, 3).map((visit) => (
                        <div
                          key={visit.visit_id}
                          className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {formatDate(visit.visit_date)}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {visit.visit_type} Visit
                              </p>
                              {visit.notes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {visit.notes}
                                </p>
                              )}
                            </div>
                            <span className="px-2 py-1 bg-blue-200 text-blue-700 rounded text-xs">
                              Upcoming
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Visits Section */}
                {pastVisits.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3">
                      RECENT VISITS
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-gray-200">
                          <tr className="text-left text-sm text-gray-600">
                            <th className="pb-3 font-medium">DATE</th>
                            <th className="pb-3 font-medium">TYPE</th>
                            <th className="pb-3 font-medium">NOTES</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {pastVisits.slice(0, 1).map((visit) => (
                            <tr
                              key={visit.visit_id}
                              className="border-b border-gray-100"
                            >
                              <td className="py-4">
                                {formatDate(visit.visit_date)}
                              </td>
                              <td className="py-4 capitalize">
                                {visit.visit_type}
                              </td>
                              <td className="py-4 text-gray-600">
                                {visit.notes || "No notes"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {upcomingVisits.length === 0 && pastVisits.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No visits recorded yet
                  </p>
                )}
              </Card>

              {/* View All Visits Link */}
              <Link
                to="/my-appointments"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm"
              >
                View all visits →
              </Link>
            </div>

            {/* My Children */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                My Children
              </h2>
              {children.length === 0 ? (
                <Card>
                  <p className="text-gray-500 text-center py-8">
                    No children registered yet
                  </p>
                  <Link
                    to="/my-children"
                    className="block mt-4 text-center text-blue-600 hover:text-blue-700"
                  >
                    Add your first child
                  </Link>
                </Card>
              ) : (
                <div className="space-y-4">
                  {children.map((child) => {
                    const age = calculateAge(child.dob);
                    return (
                      <Card
                        key={child.child_id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
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
                              Age:{" "}
                              {age.years
                                ? `${age.years} years`
                                : `${age.months} months`}{" "}
                              • {child.gender}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/child/${child.child_id}`}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                        >
                          View Profile
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MotherDashboard;
