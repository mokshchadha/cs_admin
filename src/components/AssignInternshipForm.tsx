// src/components/AssignInternshipForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Company, DatabaseUser, InternshipAssignment } from "../lib/types";

interface AssignInternshipFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: DatabaseUser | null;
}

export default function AssignInternshipForm({
  isOpen,
  onClose,
  onSuccess,
  user,
}: AssignInternshipFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedInternshipId, setSelectedInternshipId] = useState("");
  const [assignedInternships, setAssignedInternships] = useState<
    InternshipAssignment[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchCompanies();
      setAssignedInternships(user.assignedInternships || []);
    } else if (!isOpen) {
      // Reset form when closing
      setSelectedCompanyId("");
      setSelectedInternshipId("");
      setAssignedInternships([]);
      setExpandedDetails(new Set());
      setError("");
    }
  }, [isOpen, user]);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch("/api/companies?limit=100");
      const data = await response.json();
      if (response.ok) {
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
    setLoadingCompanies(false);
  };

  const selectedCompany = companies.find(
    (company) => company._id === selectedCompanyId
  );
  const availableInternships =
    selectedCompany?.internships?.filter((internship) => internship.isActive) ||
    [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!user) {
      setError("No user selected");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user._id}/assign-internship`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          internshipId: selectedInternshipId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with new internship assignment
        setAssignedInternships(data.user.assignedInternships || []);

        // Reset form fields
        setSelectedCompanyId("");
        setSelectedInternshipId("");
        onSuccess();
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Internship assignment error:", error);
      setError("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "started":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(
    new Set()
  );

  const toggleDetailsExpansion = (assignmentId: string) => {
    const newExpanded = new Set(expandedDetails);
    if (newExpanded.has(assignmentId)) {
      newExpanded.delete(assignmentId);
    } else {
      newExpanded.add(assignmentId);
    }
    setExpandedDetails(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "500px" }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Internship Assignments
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {user && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Selected User:</h3>
              <p className="text-sm text-gray-600">{user.name || "No Name"}</p>
              <p className="text-sm text-gray-600">
                {user.email || "No Email"}
              </p>
              <p className="text-sm text-gray-600">{user.phoneNumber}</p>
            </div>
          )}

          {/* Existing Internship Assignments */}
          {assignedInternships.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Current Assignments ({assignedInternships.length})
              </h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {assignedInternships.map((assignment, index) => (
                  <div
                    key={assignment._id || index}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-blue-900 truncate">
                          {assignment.designation}
                        </div>
                        <div className="text-sm text-blue-700 truncate">
                          {assignment.companyName}
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-blue-600">
                          <strong>Duration:</strong> {assignment.duration}
                        </div>
                        <div className="text-blue-600">
                          <strong>Stipend:</strong> ₹
                          {assignment.stipend.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-blue-600">
                        <strong>Location:</strong> {assignment.location}
                      </div>

                      <div className="text-blue-600">
                        <strong>Assigned:</strong>{" "}
                        {formatDate(assignment.assignedAt)}
                      </div>

                      {/* Details section */}
                      <div className="text-blue-700 mt-3">
                        <strong className="block text-blue-800 mb-1">
                          Details:
                        </strong>
                        <div className="text-sm bg-blue-25 p-2 rounded border border-blue-100">
                          <p className="text-blue-700 leading-relaxed">
                            {expandedDetails.has(assignment._id || `${index}`)
                              ? assignment.details
                              : truncateText(assignment.details, 150)}
                          </p>
                          {assignment.details.length > 150 && (
                            <button
                              className="text-blue-600 hover:text-blue-800 text-xs mt-1 underline"
                              onClick={() =>
                                toggleDetailsExpansion(
                                  assignment._id || `${index}`
                                )
                              }
                            >
                              {expandedDetails.has(assignment._id || `${index}`)
                                ? "Show less"
                                : "Read more"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Internship Assignment Form */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Assign New Internship
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                {loadingCompanies ? (
                  <div className="text-sm text-gray-500">
                    Loading companies...
                  </div>
                ) : (
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                      setSelectedInternshipId(""); // Reset internship selection
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name} (
                        {company.internships?.filter((i) => i.isActive)
                          .length || 0}{" "}
                        active internships)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internship *
                </label>
                <select
                  value={selectedInternshipId}
                  onChange={(e) => setSelectedInternshipId(e.target.value)}
                  required
                  disabled={!selectedCompanyId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedCompanyId
                      ? "Select Company first"
                      : "Select Internship"}
                  </option>
                  {availableInternships.map((internship) => (
                    <option key={internship._id} value={internship._id}>
                      {internship.designation} - ₹
                      {internship.stipend.toLocaleString()} (
                      {internship.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Internship Details Preview */}
              {selectedInternshipId && selectedCompany && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  {(() => {
                    const selectedInternship = availableInternships.find(
                      (i) => i._id === selectedInternshipId
                    );
                    if (!selectedInternship) return null;

                    return (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Internship Details:
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Company:</strong> {selectedCompany.name}
                          </p>
                          <p>
                            <strong>Designation:</strong>{" "}
                            {selectedInternship.designation}
                          </p>
                          <p>
                            <strong>Duration:</strong>{" "}
                            {selectedInternship.duration}
                          </p>
                          <p>
                            <strong>Stipend:</strong> ₹
                            {selectedInternship.stipend.toLocaleString()}
                          </p>
                          <p>
                            <strong>Location:</strong>{" "}
                            {selectedInternship.location}
                          </p>
                          <div className="mt-2">
                            <strong className="block text-gray-800 mb-1">
                              Details:
                            </strong>
                            <div className="bg-white p-2 rounded border text-gray-700 leading-relaxed">
                              {selectedInternship.details}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !selectedCompanyId ||
                  !selectedInternshipId ||
                  !user
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Assigning Internship...
                  </div>
                ) : (
                  "Assign Internship"
                )}
              </button>
            </form>
          </div>

          {/* No internships message */}
          {assignedInternships.length === 0 && (
            <div className="mt-6 text-center py-8 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No internships assigned
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This user hasn&apos;t been assigned any internships yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
