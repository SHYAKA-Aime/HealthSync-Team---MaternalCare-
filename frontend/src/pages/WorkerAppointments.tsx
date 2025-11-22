import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { visitService } from "../services/visitService";
import { formatDate } from "../utils/formatters";

// Modal Component
const StatusModal = ({
  isOpen,
  onClose,
  type,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          {type === "success" ? (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {type === "success" ? "Success" : "Error"}
          </h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className={`${
              type === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} className={`${confirmColor} text-white`}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const WorkerAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "today" | "upcoming" | "history"
  >("upcoming");
  const [visits, setVisits] = useState<any[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<any[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Modal states
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    message: string;
  }>({
    isOpen: false,
    type: "success",
    message: "",
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    visitId: number | null;
    newStatus: "scheduled" | "completed" | "cancelled" | null;
  }>({
    isOpen: false,
    visitId: null,
    newStatus: null,
  });

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [filter, visits]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const visitsData = await visitService.getVisits();
      setVisits(
        visitsData.sort(
          (a: any, b: any) =>
            new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterVisits = () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time

    let filtered: any[] = [];

    switch (filter) {
      case "today":
        filtered = visits.filter((v: any) => {
          // convert visit_date to local YYYY-MM-DD
          const visitDateStr = new Date(v.visit_date).toLocaleDateString(
            "en-CA"
          );
          return visitDateStr === todayStr && v.status !== "completed";
        });
        break;

      case "upcoming":
        filtered = visits.filter(
          (v: any) => new Date(v.visit_date) > today && v.status !== "completed"
        );
        break;

      case "history":
        filtered = visits.filter((v: any) => v.status === "completed");
        break;

      default:
        filtered = visits.filter((v: any) => v.status !== "completed");
    }

    setFilteredVisits(filtered);
  };

  const openConfirmModal = (
    visitId: number,
    newStatus: "scheduled" | "completed" | "cancelled"
  ) => {
    setConfirmModal({
      isOpen: true,
      visitId,
      newStatus,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      visitId: null,
      newStatus: null,
    });
  };

  const handleStatusUpdate = async () => {
    if (!confirmModal.visitId || !confirmModal.newStatus) return;

    try {
      setUpdatingStatus(confirmModal.visitId);
      closeConfirmModal();

      await visitService.updateVisitStatus(
        confirmModal.visitId,
        confirmModal.newStatus
      );

      // Update local state
      setVisits((prevVisits) =>
        prevVisits.map((visit) =>
          visit.visit_id === confirmModal.visitId
            ? { ...visit, status: confirmModal.newStatus }
            : visit
        )
      );

      // Show success modal
      setStatusModal({
        isOpen: true,
        type: "success",
        message: `Visit marked as ${confirmModal.newStatus} successfully!`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      // Show error modal
      setStatusModal({
        isOpen: true,
        type: "error",
        message: "Failed to update visit status. Please try again.",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      type: "success",
      message: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      scheduled: "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusStyles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConfirmationMessage = (newStatus: string) => {
    if (newStatus === "completed") {
      return "Are you sure you want to mark this visit as completed? It will be moved to history.";
    } else if (newStatus === "scheduled") {
      return "Are you sure you want to reopen this visit? It will be moved back to active appointments.";
    }
    return "Are you sure you want to update this visit status?";
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
              <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
              <Link to="/record-visit">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  + Record Visit
                </Button>
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setFilter("all")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Active ({visits.filter((v) => v.status !== "completed").length})
              </button>
              <button
                onClick={() => setFilter("today")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === "today"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === "upcoming"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter("history")}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  filter === "history"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                History ({visits.filter((v) => v.status === "completed").length}
                )
              </button>
            </div>

            {/* Appointments List */}
            <Card>
              {filteredVisits.length === 0 ? (
                <p className="text-center text-gray-500 py-12">
                  No appointments found
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="pb-3 font-medium">DATE</th>
                        <th className="pb-3 font-medium">PATIENT</th>
                        <th className="pb-3 font-medium">TYPE</th>
                        <th className="pb-3 font-medium">VITALS</th>
                        <th className="pb-3 font-medium">STATUS</th>
                        <th className="pb-3 font-medium">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredVisits.map((visit) => (
                        <tr
                          key={visit.visit_id}
                          className="border-b border-gray-100 hover:bg-gray-50"
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
                            {visit.weight && <span>{visit.weight}kg</span>}
                            {visit.weight && visit.blood_pressure && (
                              <span> • </span>
                            )}
                            {visit.blood_pressure && (
                              <span>{visit.blood_pressure}</span>
                            )}
                            {!visit.weight && !visit.blood_pressure && (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4">
                            {getStatusBadge(visit.status)}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/appointment/${visit.visit_id}`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                View
                              </Link>

                              {visit.status === "scheduled" && (
                                <button
                                  onClick={() =>
                                    openConfirmModal(
                                      visit.visit_id,
                                      "completed"
                                    )
                                  }
                                  disabled={updatingStatus === visit.visit_id}
                                  className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingStatus === visit.visit_id
                                    ? "Updating..."
                                    : "Complete"}
                                </button>
                              )}

                              {visit.status === "completed" && (
                                <button
                                  onClick={() =>
                                    openConfirmModal(
                                      visit.visit_id,
                                      "scheduled"
                                    )
                                  }
                                  disabled={updatingStatus === visit.visit_id}
                                  className="text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {updatingStatus === visit.visit_id
                                    ? "Updating..."
                                    : "Reopen"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleStatusUpdate}
        title={
          confirmModal.newStatus === "completed"
            ? "Complete Visit"
            : "Reopen Visit"
        }
        message={getConfirmationMessage(confirmModal.newStatus || "")}
        confirmText={
          confirmModal.newStatus === "completed" ? "Mark Complete" : "Reopen"
        }
        confirmColor={
          confirmModal.newStatus === "completed"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-orange-600 hover:bg-orange-700"
        }
      />

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        type={statusModal.type}
        message={statusModal.message}
      />
    </div>
  );
};

export default WorkerAppointments;
