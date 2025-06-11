/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AssignCourseForm.tsx
"use client";

import { useState, useEffect } from "react";
import universities from "../lib/universities.json";
import coursesData from "../lib/courses";
import { DatabaseUser, CourseAssignment } from "../lib/types";

interface AssignCourseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: DatabaseUser | null;
}

interface Course {
  course: string;
  specialization: string;
}

export default function AssignCourseForm({
  isOpen,
  onClose,
  onSuccess,
  user,
}: AssignCourseFormProps) {
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<
    string[]
  >([]);
  const [assignedCourses, setAssignedCourses] = useState<CourseAssignment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const universityOptions = Object.entries(universities).map(
    ([code, data]) => ({
      code,
      name: data.name,
    })
  );

  useEffect(() => {
    if (selectedUniversity) {
      const courses =
        (coursesData[
          selectedUniversity as keyof typeof coursesData
        ] as Course[]) || [];
      setAvailableCourses(courses);
      setSelectedCourse("");
      setSelectedSpecialization("");
      setAvailableSpecializations([]);
    }
  }, [selectedUniversity]);

  useEffect(() => {
    if (selectedCourse && availableCourses.length > 0) {
      const specializations = availableCourses
        .filter((course) => course.course === selectedCourse)
        .map((course) => course.specialization);
      setAvailableSpecializations(specializations);
      setSelectedSpecialization("");
    }
  }, [selectedCourse, availableCourses]);

  useEffect(() => {
    if (user && isOpen) {
      // Load user's assigned courses
      setAssignedCourses(user.assignedCourses || []);
    } else if (!isOpen) {
      // Reset form when closing
      setSelectedUniversity("");
      setSelectedCourse("");
      setSelectedSpecialization("");
      setAvailableCourses([]);
      setAvailableSpecializations([]);
      setAssignedCourses([]);
      setError("");
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!user) {
      setError("No user selected");
      setIsLoading(false);
      return;
    }

    // Validate user data for external API
    if (!user.name || !user.email) {
      setError("User must have name and email to assign courses");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/${user._id}/assign-course`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          university: selectedUniversity,
          course: selectedCourse,
          specialization: selectedSpecialization,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with new course
        setAssignedCourses(data.user.assignedCourses || []);

        // Reset form fields
        setSelectedUniversity("");
        setSelectedCourse("");
        setSelectedSpecialization("");
        setAvailableCourses([]);
        setAvailableSpecializations([]);
        onSuccess();
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (error) {
      console.error("Course assignment error:", error);
      setError("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  const uniqueCourses = [
    ...new Set(availableCourses.map((course) => course.course)),
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUniversityName = (code: string) => {
    return universities[code as keyof typeof universities]?.name || code;
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
              Manage Course Subscriptions
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
              {(!user.name || !user.email) && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠ Name and email are required for course assignment
                </p>
              )}
            </div>
          )}

          {/* Existing Courses */}
          {assignedCourses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Current Subscriptions ({assignedCourses.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {assignedCourses.map((courseAssignment: any, index) => (
                  <div
                    key={courseAssignment._id || index}
                    className="p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-green-900 truncate">
                          {courseAssignment.course}
                        </div>
                        <span
                          className="text-green-600"
                          title="Successfully assigned"
                        >
                          ✓
                        </span>
                      </div>
                      <div className="text-sm text-green-700 truncate">
                        {courseAssignment.specialization}
                      </div>
                      <div className="text-xs text-green-600 truncate">
                        {getUniversityName(courseAssignment.university)}
                      </div>
                      <div className="text-xs text-green-500">
                        Assigned: {formatDate(courseAssignment.assignedAt)}
                      </div>
                      <div className="text-xs text-green-600 font-mono">
                        Student ID: {courseAssignment.studentId}
                      </div>
                      <div className="text-xs text-gray-600">
                        Status:{" "}
                        {courseAssignment.externalApiStatus
                          ? "Success"
                          : "Failed"}
                        <span className="ml-2">
                          | Exists: {courseAssignment.externalApiExists}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600">
                        {courseAssignment.externalApiMessage}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Course Form */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Add New Course
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University *
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select University</option>
                  {universityOptions.map((university) => (
                    <option key={university.code} value={university.code}>
                      {university.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                  disabled={!selectedUniversity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedUniversity
                      ? "Select University first"
                      : "Select Course"}
                  </option>
                  {uniqueCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization *
                </label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  required
                  disabled={!selectedCourse}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedCourse
                      ? "Select Course first"
                      : "Select Specialization"}
                  </option>
                  {availableSpecializations.map((specialization) => (
                    <option key={specialization} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !selectedUniversity ||
                  !selectedCourse ||
                  !selectedSpecialization ||
                  !user?.name ||
                  !user?.email
                }
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Adding Course & Generating Student ID...
                  </div>
                ) : (
                  "Add Course & Generate Student ID"
                )}
              </button>
            </form>
          </div>

          {/* No courses message */}
          {assignedCourses.length === 0 && (
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No courses assigned
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This user hasn&apos;t been assigned any courses yet.
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
