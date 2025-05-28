// src/components/CandidateForm.tsx
"use client";

import { omit } from "lodash";

import { DatabaseUser } from "@/lib/types";
import { useState, useEffect } from "react";

interface CandidateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: DatabaseUser | null;
  isEditing?: boolean;
}

export default function CandidateForm({
  isOpen,
  onClose,
  onSuccess,
  user,
  isEditing = false,
}: CandidateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyEmail: "",
    phoneNumber: "",
    officeEmail: "",
    cinPanGst: "",
    password: "",
    agreeToTerms: false,
    isRecruiter: false,
    isVerified: false,
    remarks: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && isEditing) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        companyEmail: user.companyEmail || "",
        phoneNumber: user.phoneNumber || "",
        officeEmail: user.officeEmail || "",
        cinPanGst: user.cinPanGst || "",
        password: "",
        agreeToTerms: user.agreeToTerms || false,
        isRecruiter: user.isRecruiter || false,
        isVerified: user.isVerified || false,
        remarks: user.remarks || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        companyEmail: "",
        phoneNumber: "",
        officeEmail: "",
        cinPanGst: "",
        password: "",
        agreeToTerms: false,
        isRecruiter: false,
        isVerified: false,
        remarks: "",
      });
    }
  }, [user, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const url = isEditing ? `/api/users/${user?._id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      // Don't send empty password for updates
      let submitData = { ...formData };
      if (isEditing && !submitData.password) {
        submitData = omit(submitData, "password") as typeof submitData;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
              {isEditing ? "Edit User" : "Add New User"}
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
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created at *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toISOString().slice(0, 10)
                      : new Date().toISOString().slice(0, 10)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  disabled
                />
                <input
                  type="time"
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toTimeString().slice(0, 5)
                      : new Date().toTimeString().slice(0, 5)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.name}
                onChange={handleChange}
                placeholder="User name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company email
              </label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter value"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office email
              </label>
              <input
                type="email"
                name="officeEmail"
                value={formData.officeEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cin pan gst
              </label>
              <input
                type="text"
                name="cinPanGst"
                value={formData.cinPanGst}
                onChange={handleChange}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Agree to terms *</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isRecruiter"
                  checked={formData.isRecruiter}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Is recruiter</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Is verified *</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Updated at *
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={
                    user?.updatedAt
                      ? new Date(user.updatedAt).toISOString().slice(0, 10)
                      : new Date().toISOString().slice(0, 10)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  disabled
                />
                <input
                  type="time"
                  value={
                    user?.updatedAt
                      ? new Date(user.updatedAt).toTimeString().slice(0, 5)
                      : new Date().toTimeString().slice(0, 5)
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  disabled
                />
              </div>
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
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
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-medium"
          >
            {isLoading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
