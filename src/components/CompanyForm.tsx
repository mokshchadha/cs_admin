// src/components/CompanyForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Company } from "../lib/types";

interface CompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company: Company | null;
  isEditing?: boolean;
}

export default function CompanyForm({
  isOpen,
  onClose,
  onSuccess,
  company,
  isEditing = false,
}: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (company && isEditing) {
      setFormData({
        name: company.name || "",
      });
    } else {
      setFormData({
        name: "",
      });
    }
  }, [company, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = isEditing
        ? `/api/companies/${company?._id}`
        : "/api/companies";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "400px" }}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Edit Company" : "Add New Company"}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter company name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {isEditing && company && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <input
                    type="text"
                    value={new Date(company.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Internships
                  </label>
                  <input
                    type="text"
                    value={company.internships?.length || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Active Internships
                  </label>
                  <input
                    type="text"
                    value={
                      company.internships?.filter(
                        (internship) => internship.isActive
                      ).length || 0
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company ID
                  </label>
                  <input
                    type="text"
                    value={company._id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                    disabled
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !formData.name.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-medium"
          >
            {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
