import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EmployeeTable from '../components/EmployeeTable';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Search, Filter, Settings } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchName) query.append('name', searchName);
      if (searchDept) query.append('department', searchDept);
      
      const endpoint = (searchName || searchDept) ? `/employees/search?${query.toString()}` : '/employees';
      const response = await api.get(endpoint);
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchName, searchDept]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
            {user?.role === 'admin' && (
              <Link
                to="/management"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Employee Management
              </Link>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Filter by department..."
                value={searchDept}
                onChange={(e) => setSearchDept(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-600"></div>
            </div>
          ) : (
            <EmployeeTable employees={employees} isAdmin={false} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
