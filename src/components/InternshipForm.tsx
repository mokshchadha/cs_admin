// src/components/InternshipForm.tsx
"use client";

import { useState } from "react";
import { Company } from "../lib/types";

interface InternshipFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company: Company | null;
}

export default function InternshipForm({
  isOpen,
  onClose,
  onSuccess,
  company,
}: InternshipFormProps) {
  const [formData, setFormData] = useState({
    designation: "",
    duration: "",
    stipend: "",
    location: "",
    details: "",
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!company) {
      setError("No company selected");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/companies/${company._id}/internships`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            stipend: Number(formData.stipend),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setFormData({
          designation: "",
          duration: "",
          stipend: "",
          location: "",
          details: "",
          isActive: true,
        });
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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
              Add New Internship
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
          {company && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Company:</h3>
              <p className="text-sm text-gray-600">{company.name}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                placeholder="e.g., Software Developer Intern"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                placeholder="e.g., 3 months, 6 months"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stipend (₹) *
              </label>
              <input
                type="number"
                name="stipend"
                value={formData.stipend}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g., 15000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Remote, Bangalore, Mumbai"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details *
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe the internship responsibilities, requirements, and other details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Active Internship</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Only active internships can be assigned to users
              </p>
            </div>
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
            disabled={
              isLoading ||
              !formData.designation.trim() ||
              !formData.duration.trim() ||
              !formData.stipend ||
              !formData.location.trim() ||
              !formData.details.trim()
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-medium"
          >
            {isLoading ? "Adding..." : "Add Internship"}
          </button>
        </div>
      </div>
    </div>
  );
}
