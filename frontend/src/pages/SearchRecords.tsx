import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { motherService } from "../services/motherService";
import { childService } from "../services/childService";
import { visitService } from "../services/visitService";
import { vaccinationService } from "../services/vaccinationService";
import { formatDate } from "../utils/formatters";

const SearchRecords = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("mother");
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      let data: any[] = [];

      switch (searchType) {
        case "mother":
          const mothers = await motherService.getMothers();
          data = mothers.filter(
            (m: any) =>
              m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
          break;

        case "child":
          const children = await childService.getChildren();
          data = children.filter((c: any) =>
            c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          break;

        case "visit":
          const visits = await visitService.getVisits();
          data = visits.filter(
            (v: any) =>
              v.mother_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              v.visit_type.toLowerCase().includes(searchTerm.toLowerCase())
          );
          break;

        case "vaccination":
          const vaccinations = await vaccinationService.getVaccinations();
          data = vaccinations.filter(
            (v: any) =>
              v.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              v.vaccine_name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          break;
      }

      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role="health_worker" />

      <div className="flex">
        <Sidebar role="health_worker" />

        <main className="flex-1 p-8">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Search Records
            </h1>

            <Card className="mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Term
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter name, email, or keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Record Type
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="mother">Mothers</option>
                      <option value="child">Children</option>
                      <option value="visit">Visits</option>
                      <option value="vaccination">Vaccinations</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={loading}
                >
                  {loading ? <Loader /> : "Search"}
                </Button>
              </form>
            </Card>

            {/* Results */}
            {hasSearched && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Search Results ({results.length})
                </h2>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader />
                  </div>
                ) : results.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">
                    No results found for "{searchTerm}"
                  </p>
                ) : (
                  <div className="space-y-4">
                    {searchType === "mother" &&
                      results.map((mother: any) => (
                        <div
                          key={mother.mother_id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {mother.full_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {mother.email}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {mother.pregnancy_stage} • {mother.location}
                              </p>
                            </div>
                            <Link
                              to={`/patient/${mother.mother_id}`}
                              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      ))}

                    {searchType === "child" &&
                      results.map((child: any) => (
                        <div
                          key={child.child_id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h3 className="font-semibold text-gray-900">
                            {child.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            DOB: {formatDate(child.dob)} • {child.gender}
                          </p>
                        </div>
                      ))}

                    {searchType === "visit" &&
                      results.map((visit: any) => (
                        <div
                          key={visit.visit_id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 capitalize">
                                {visit.visit_type} Visit
                              </h3>
                              <p className="text-sm text-gray-600">
                                {visit.mother_name} •{" "}
                                {formatDate(visit.visit_date)}
                              </p>
                              {visit.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {visit.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                    {searchType === "vaccination" &&
                      results.map((vaccination: any) => (
                        <div
                          key={vaccination.vaccine_id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <h3 className="font-semibold text-gray-900">
                            {vaccination.vaccine_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vaccination.child_name} •{" "}
                            {formatDate(vaccination.date_given)}
                          </p>
                          {vaccination.administered_by && (
                            <p className="text-sm text-gray-600 mt-1">
                              Administered by: {vaccination.administered_by}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchRecords;
