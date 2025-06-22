// src/app/companies/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import CompanyForm from "../../components/CompanyForm";
import InternshipForm from "../../components/InternshipForm";
import { Company } from "../../lib/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function CompaniesPage() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState("");
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [isInternshipFormOpen, setIsInternshipFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: search,
      });

      const response = await fetch(`/api/companies?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCompanies(data.companies);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
    setCompaniesLoading(false);
  }, [pagination.page, pagination.limit, search]);

  useEffect(() => {
    if (!loading) {
      fetchCompanies();
    }
  }, [fetchCompanies, loading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setIsEditingCompany(false);
    setIsCompanyFormOpen(true);
  };

  const handleEditCompany = (company?: Company) => {
    const companyToEdit = company || selectedCompany;
    if (companyToEdit) {
      setSelectedCompany(companyToEdit);
      setIsEditingCompany(true);
      setIsCompanyFormOpen(true);
    }
  };

  const handleAddInternship = () => {
    if (selectedCompany) {
      setIsInternshipFormOpen(true);
    }
  };

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleFormSuccess = () => {
    fetchCompanies();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <div
      className={`transition-all duration-300 ease-in-out ${
        isCompanyFormOpen || isInternshipFormOpen ? "mr-[400px]" : ""
      }`}
    >
      <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Company Management
            </h1>
            <p className="mt-1 text-gray-600">
              Manage companies and their internships
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => handleEditCompany()}
              disabled={!selectedCompany}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedCompany
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Edit Company
            </button>
            <button
              onClick={handleAddInternship}
              disabled={!selectedCompany}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedCompany
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Add Internship
            </button>
            <button
              onClick={handleCreateCompany}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Add Company
            </button>
          </div>
        </div>

        {/* Selected Company Info */}
        {selectedCompany && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {selectedCompany.name}
              {selectedCompany.internships &&
                selectedCompany.internships.length > 0 && (
                  <span className="ml-2">
                    - <strong>Internships:</strong>{" "}
                    {selectedCompany.internships.length}
                  </span>
                )}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={handleSearch}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Companies Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {companiesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading companies...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Internships
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Internships
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr
                      key={company._id}
                      onClick={() => handleCompanyClick(company)}
                      onDoubleClick={() => handleEditCompany(company)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedCompany?._id === company._id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(company.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.internships?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.internships?.filter(
                          (internship) => internship.isActive
                        ).length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {company._id.slice(-8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Internships for Selected Company */}
        {selectedCompany &&
          selectedCompany.internships &&
          selectedCompany.internships.length > 0 && (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Internships at {selectedCompany.name}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Designation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stipend
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedCompany.internships.map((internship) => (
                      <tr key={internship._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {internship.designation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {internship.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{internship.stipend.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {internship.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              internship.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {internship.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(internship.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(pagination.pages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      page === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Company Form Slide Panel */}
      <CompanyForm
        isOpen={isCompanyFormOpen}
        onClose={() => {
          setIsCompanyFormOpen(false);
          setSelectedCompany(null);
        }}
        onSuccess={handleFormSuccess}
        company={selectedCompany}
        isEditing={isEditingCompany}
      />

      {/* Internship Form Slide Panel */}
      <InternshipForm
        isOpen={isInternshipFormOpen}
        onClose={() => {
          setIsInternshipFormOpen(false);
        }}
        onSuccess={handleFormSuccess}
        company={selectedCompany}
      />
    </div>
  );
}
