
"use client";

import { useState, useEffect } from "react";
import { DatabaseUser, Tag } from "../lib/types";

interface ManageTagsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: DatabaseUser | null;
}

export default function ManageTagsForm({
  isOpen,
  onClose,
  onSuccess,
  user,
}: ManageTagsFormProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      if (user && user.tags) {
        // Handle populated tags (objects) or IDs
        const tagIds = user.tags.map((t) =>
          typeof t === "string" ? t : t._id
        );
        setSelectedTags(tagIds);
      } else {
        setSelectedTags([]);
      }
    }
  }, [isOpen, user]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tags");
      const data = await response.json();
      if (response.ok) {
        setAvailableTags(data.tags);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
    setLoading(false);
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags: selectedTags }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update tags");
      }
    } catch (error) {
      console.error("Error updating user tags:", error);
      setError("An error occurred");
    }
    setSaving(false);
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
            <h2 className="text-xl font-semibold text-gray-900">Manage Tags</h2>
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
          {user && (
            <p className="text-sm text-gray-500 mt-1">
              Assign tags to <strong>{user.name}</strong>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              {availableTags.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No tags available. Go to Tags page to create some.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag._id}
                      onClick={() => handleToggleTag(tag._id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                        selectedTags.includes(tag._id)
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {tag.name}
                      {selectedTags.includes(tag._id) && (
                        <span className="ml-2 text-blue-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
