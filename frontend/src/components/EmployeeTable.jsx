import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const EmployeeTable = ({ employees, onEdit, onDelete, isAdmin }) => {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Department</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
            {isAdmin && <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {employees.map((person) => {
            const id = person.employeeId || person.id || person._id;
            return (
              <tr key={id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{person.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {person.department}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.position}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${person.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {person.status || 'Active'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button onClick={() => onEdit(person)} className="text-brand-600 hover:text-brand-900 mr-4 transition-colors">
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    <button onClick={() => onDelete(id)} className="text-red-600 hover:text-red-900 transition-colors">
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
          {employees.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-sm text-gray-500">
                No employees found matching the given criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
