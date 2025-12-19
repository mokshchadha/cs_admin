
"use client";

import { useState, useEffect } from "react";
import { Tag } from "../../lib/types";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    definition: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      if (response.ok) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ name: "", definition: "" });
        fetchTags();
      } else {
        setError(data.message || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      setError("An error occurred");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Tag Form */}
        <div className="md:col-span-1">
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Create New Tag
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tag Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. VIP, Checked"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Definition
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.definition}
                  onChange={(e) =>
                    setFormData({ ...formData, definition: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe what this tag means..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {submitting ? "Creating..." : "Create Tag"}
              </button>
            </form>
          </div>
        </div>

        {/* Tags List */}
        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Existing Tags
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {tags.length === 0 ? (
                <li className="px-4 py-8 text-center text-gray-500">
                  No tags created yet.
                </li>
              ) : (
                tags.map((tag) => (
                  <li key={tag._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 w-fit mb-1">
                          {tag.name}
                        </span>
                        <p className="text-sm text-gray-500">
                          {tag.definition}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
