import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { visitService } from "../services/visitService";
import { motherService } from "../services/motherService";
import { formatDate } from "../utils/formatters";

// Status Modal Component
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

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
    newStatus: "scheduled" | "completed" | "cancelled" | null;
  }>({
    isOpen: false,
    newStatus: null,
  });

  useEffect(() => {
    if (id) {
      fetchVisitData();
    }
  }, [id]);

  const fetchVisitData = async () => {
    try {
      setLoading(true);
      const visitData = await visitService.getVisit(parseInt(id!));
      setVisit(visitData);

      // Fetch patient details
      const patientData = await motherService.getMother(visitData.mother_id);
      setPatient(patientData);
    } catch (error) {
      console.error("Error fetching visit data:", error);
      navigate("/appointments");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (
    newStatus: "scheduled" | "completed" | "cancelled"
  ) => {
    setConfirmModal({
      isOpen: true,
      newStatus,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      newStatus: null,
    });
  };

  const handleStatusUpdate = async () => {
    if (!confirmModal.newStatus || !visit) return;

    try {
      setUpdatingStatus(true);
      closeConfirmModal();

      await visitService.updateVisitStatus(
        visit.visit_id,
        confirmModal.newStatus
      );

      // Update local state
      setVisit((prev: any) => ({
        ...prev,
        status: confirmModal.newStatus,
      }));

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
      setUpdatingStatus(false);
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
        className={`px-4 py-2 rounded-full text-sm font-medium ${
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
    } else if (newStatus === "cancelled") {
      return "Are you sure you want to cancel this visit?";
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

  if (!visit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="health_worker" />

      <div className="flex">
        <Sidebar role="health_worker" />

        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            <Button
              onClick={() => navigate("/appointments")}
              className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              ← Back to Appointments
            </Button>

            {/* Visit Header */}
            <Card className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 capitalize mb-2">
                    {visit.visit_type} Visit
                  </h1>
                  <p className="text-gray-600">
                    {formatDate(visit.visit_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(visit.status)}
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-200">
                {visit.status === "scheduled" && (
                  <>
                    <Button
                      onClick={() => openConfirmModal("completed")}
                      disabled={updatingStatus}
                      className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? "Updating..." : "Mark as Completed"}
                    </Button>
                    <Button
                      onClick={() => openConfirmModal("cancelled")}
                      disabled={updatingStatus}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus ? "Updating..." : "Cancel Visit"}
                    </Button>
                  </>
                )}

                {visit.status === "completed" && (
                  <Button
                    onClick={() => openConfirmModal("scheduled")}
                    disabled={updatingStatus}
                    className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? "Updating..." : "Reopen Visit"}
                  </Button>
                )}

                {visit.status === "cancelled" && (
                  <Button
                    onClick={() => openConfirmModal("scheduled")}
                    disabled={updatingStatus}
                    className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? "Updating..." : "Reactivate Visit"}
                  </Button>
                )}
              </div>

              {/* Patient Info */}
              {patient && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>{" "}
                      <span className="font-medium">{patient.full_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>{" "}
                      <span className="font-medium">{patient.email}</span>
                    </div>
                    {patient.phone && (
                      <div>
                        <span className="text-gray-600">Phone:</span>{" "}
                        <span className="font-medium">{patient.phone}</span>
                      </div>
                    )}
                    {patient.blood_group && (
                      <div>
                        <span className="text-gray-600">Blood Group:</span>{" "}
                        <span className="font-medium">
                          {patient.blood_group}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => navigate(`/patient/${patient.mother_id}`)}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                  >
                    View Full Profile
                  </Button>
                </div>
              )}
            </Card>

            {/* Visit Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Vital Signs
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">
                      {visit.weight ? `${visit.weight} kg` : "Not recorded"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blood Pressure:</span>
                    <span className="font-medium">
                      {visit.blood_pressure || "Not recorded"}
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Visit Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">
                      {visit.visit_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {formatDate(visit.visit_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">
                      {visit.status}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Notes */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">
                Notes & Observations
              </h3>
              {visit.notes ? (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {visit.notes}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No notes recorded for this visit
                </p>
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
            : confirmModal.newStatus === "cancelled"
            ? "Cancel Visit"
            : "Reopen Visit"
        }
        message={getConfirmationMessage(confirmModal.newStatus || "")}
        confirmText={
          confirmModal.newStatus === "completed"
            ? "Mark Complete"
            : confirmModal.newStatus === "cancelled"
            ? "Cancel Visit"
            : "Reopen"
        }
        confirmColor={
          confirmModal.newStatus === "completed"
            ? "bg-green-600 hover:bg-green-700"
            : confirmModal.newStatus === "cancelled"
            ? "bg-red-600 hover:bg-red-700"
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

export default AppointmentDetails;
